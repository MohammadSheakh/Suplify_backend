# Doctor Appointment Booking Flow

  ┌──────┐
  │      │
  └──────┘

├─┤  ┬  ┴  ┼  ▼  ►  ◄  ▲

      ┌──────┴──────┐
      │             │
   VISE?          PAID?
      │             │


available 
  └─(user books)→ pending (if payment required)
      ├─(payment success)→ booked
      └─(timeout / fail)→ available

https://asciiflow.com/#/ 

## Overview
Complete payment and scheduling workflow for doctor-patient appointments.

## System Architecture

### Key Components
- **Payment Gateway**: Stripe Checkout
- **Queue System**: BullMQ for scheduled tasks
- **Webhook Handler**: Stripe webhook processor
- **Notification System**: Real-time notifications

## Complete User Journey

### Phase 1: Booking Initiation (`createV2`)
┌─────────────────────────────────────┐
│ User requests appointment booking   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Validate user subscription          │
│ - none: ❌ Reject                   │
│ - freeTrial: 💳 Requires payment    │
│ - standard/standardPlus: 💳 Pay     │
│ - vise: ✅ Free (with relation)     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Check schedule availability         │
│ - Must be 'available' status        │
│ - Must be future date               │
└────────────┬────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
   VISE?          PAID?
      │             │
      ▼             ▼
   [FREE]      [PAYMENT]
   FLOW         FLOW






### Phase 2A: Free Booking (VISE Subscription)
```
1. Check doctor-patient relationship exists
2. Update schedule: status -> booked
3. Create booking: status -> scheduled, payment -> unpaid
4. Queue auto-expiry job
5. Send notification to doctor
6. Return booking record
```

### Phase 2B: Paid Booking Flow
```
1. Create/retrieve Stripe customer
2. Start MongoDB transaction:
   a. Set schedule: status -> pending
   b. Create booking: status -> pending, payment -> unpaid
   c. Queue 15-min timeout (free if not paid)
   d. Queue auto-expiry job
3. Create Stripe Checkout session
4. Return payment URL to user
```

### Phase 3: Payment Processing (Webhook)

#### Success Path:
```
Stripe Webhook → handlePaymentSucceed()
   ↓
1. Create PaymentTransaction record
2. Update booking:
   - status: pending → scheduled
   - paymentStatus: unpaid → paid
   - link paymentTransactionId
3. Update schedule:
   - status: pending → booked
   - assign booked_by: patientId
4. Add amount to doctor's wallet
5. Send notifications:
   - To doctor: "Patient X booked"
   - To admin: "New booking"
```

#### Failure Path:
```
Stripe Webhook → handlePaymentFailed()
   ↓
1. Update booking:
   - status: pending → cancelled
   - paymentStatus: unpaid → failed
2. Update schedule:
   - status: pending → available
   - clear booked_by
3. Send cancellation notifications
```

### Phase 4: Auto-Scheduling (BullMQ Workers)

#### Job: `makeDoctorAppointmentScheduleAvailable`
**Trigger**: After appointment end time
**Actions**:
1. Mark current schedule: status -> expired
2. Create new schedule for next day (same time)
3. Update booking: status -> completed

#### Job: `makeDoctorAppointmentScheduleAvailableIfNotBooked`
**Trigger**: 15 minutes after booking initiation
**Condition**: If payment not completed
**Actions**:
1. Free schedule: status -> available
2. Clear booked_by field

#### Job: `expireDoctorAppointmentScheduleAfterEndTime`
**Trigger**: After appointment end time (no booking)
**Actions**:
1. Mark schedule: status -> expired

## State Diagrams

### Schedule Status Flow
```
available → pending → booked → expired
   ↑          ↓
   └─────────┘
   (timeout/failure)
```

### Booking Status Flow
```
pending → scheduled → completed
   ↓
cancelled (payment failed)
```

## Database Schema Relationships
```
DoctorAppointmentSchedule
   ├─ createdBy → Doctor
   ├─ booked_by → Patient (when booked)
   └─ referenced by → DoctorPatientScheduleBooking

DoctorPatientScheduleBooking
   ├─ patientId → User
   ├─ doctorId → Doctor
   ├─ doctorScheduleId → DoctorAppointmentSchedule
   └─ paymentTransactionId → PaymentTransaction

PaymentTransaction
   └─ referenceId → DoctorPatientScheduleBooking
```

## Error Scenarios & Handling

| Scenario | Handling |
|----------|----------|
| No subscription | 403: "Subscribe to book" |
| Schedule unavailable | 404: "Schedule not found" |
| Payment timeout | Auto-free schedule after 15min |
| Webhook failure | Manual reconciliation needed |
| Duplicate booking | Check pending status |

## Configuration

### Queue Delays
- Auto-complete: `endTime - now`
- Payment timeout: `15 minutes`
- Schedule expiry: `endTime`

### Notification Types
- `appointmentBooking`: To doctor
- `workoutClassPurchase`: To admin (note: reuse for appointments)

## Testing Checklist

- [ ] VISE user with existing relation
- [ ] Standard user payment flow
- [ ] Payment timeout (15 min)
- [ ] Webhook success/failure
- [ ] Schedule auto-creation next day
- [ ] Concurrent booking attempts
- [ ] Stripe customer creation/reuse

## Future Improvements

1. Auto-delete expired schedules after 7 days (CRON job)
2. Handle `freeTrial` subscription logic
3. Add booking cancellation by user
4. Implement refund workflow
5. Add booking modification feature