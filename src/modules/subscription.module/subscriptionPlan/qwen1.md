# Subscription Purchase Fixes Summary

## Issues Fixed

### 1. UserSubscription & PaymentTransaction Not Created on Purchase
**Problem:** When a patient purchased a standard subscription, `UserSubscription` remained in `processing` status and `PaymentTransaction` was never created.

**Root Cause:** We were trying to handle subscription purchase in `invoice.payment_succeeded` webhook, but `invoice.subscription` is `undefined` in that event (Stripe doesn't expand nested objects by default in webhooks).

**Fix:**
- Moved UserSubscription purchase handling to `checkout.session.completed` webhook (`handlePaymentSucceeded.ts`)
- This webhook has `session.subscription` (subscription ID as string) directly available
- Creates `PaymentTransaction`, activates `UserSubscription`, updates user's `subscriptionType`
- Skips duplicate processing in `invoice.payment_succeeded` (`subscription_create` returns early)
- Skips duplicate processing in `customer.subscription.created` (dates now set in checkout handler)

**Files Changed:**
- `src/modules/payment.module/stripeWebhook/handlePaymentSucceeded.ts`
- `src/modules/payment.module/stripeWebhook/handleSuccessfulPayment.ts`
- `src/modules/payment.module/stripeWebhook/webhookHandler.ts`

---

### 2. `expirationDate` Same as `subscriptionStartDate`
**Problem:** All three dates were set to the same value:
```json
"subscriptionStartDate": "2026-04-13T10:18:40.000Z",
"currentPeriodStartDate": "2026-04-13T10:18:40.000Z",
"expirationDate": "2026-04-13T10:18:40.000Z"  // ← Should be May 13, 2026!
```

**Root Cause:** `subscription.latest_invoice.period_end` was sometimes identical to `period_start` for the first billing cycle, causing expiration date to be the same as start date.

**Fix:**
- Always adds +1 month from `subscriptionStartDate` for `expirationDate`
- Only uses Stripe's `periodEnd` if it's strictly greater than `periodStart`
- Added date validation and logging

**Files Changed:**
- `src/modules/payment.module/stripeWebhook/handlePaymentSucceeded.ts`

---

### 3. Cron Job Cancelling Active Auto-Renewing Subscriptions
**Problem:** The cron job (`checkAndExpireUserSubscription`) was cancelling active recurring subscriptions because it only checked `expirationDate < currentDate`.

**Root Cause:** When `UserSubscription` was first created in `purchaseSubscriptionForSuplify`, `isAutoRenewed` was NOT set (defaulted to `false`). The cron job (runs every 60 min for testing) then found this subscription with:
- `cancelledAtPeriodEnd: false` ✅
- `isAutoRenewed: false` ✅ (default from model)
- `expirationDate: null` (which is `< currentDate`) ✅

And incorrectly cancelled it.

**Fix:**
- Set `isAutoRenewed: true` and `billingCycle: 0` when creating UserSubscription in `purchaseSubscriptionForSuplify`
- Cron query now includes `isAutoRenewed: false` to exclude auto-renewing subscriptions
- Added double-check inside loop to skip auto-renewing subscriptions
- Explicitly set `cancelledAtPeriodEnd: false` when activating subscription in webhook

**Files Changed:**
- `src/modules/subscription.module/subscriptionPlan/subscriptionPlan.service.ts`
- `src/modules/subscription.module/userSubscription/userSubscription.cron.ts`
- `src/modules/payment.module/stripeWebhook/handlePaymentSucceeded.ts`

---

### 4. `cancelledAt` Set Automatically on Purchase (Pre-save Hook)
**Problem:** The Mongoose pre-save hook in `userSubscription.model.ts` was incorrectly setting `status = expired` on newly created subscriptions.

**Root Cause:**
- `subscriptionStartDate` is `null` during purchase
- `this.renewalFrequncy` is `undefined` (not set on model)
- `new Date(null)` creates `1970-01-01` (invalid date)
- `renewalDate < new Date()` is true → status becomes `expired`

**Fix:**
- Don't calculate `renewalDate` if `subscriptionStartDate` is null
- Don't set status to `expired` if `renewalDate` is null or invalid
- Use `monthly` (30 days) as default renewal frequency instead of undefined `renewalFrequncy`

**Files Changed:**
- `src/modules/subscription.module/userSubscription/userSubscription.model.ts`

---

### 5. User's `subscriptionType` Not Updated After Successful Payment
**Problem:** After subscription purchase succeeded, the user's `subscriptionType` remained unchanged (not updated to `standard`).

**Fix:**
- Added `User.findByIdAndUpdate()` to set `subscriptionType` and `hasUsedFreeTrial: true` after successful payment

**Files Changed:**
- `src/modules/payment.module/stripeWebhook/handlePaymentSucceeded.ts`

---

## Correct Purchase Flow (After Fixes)

```
User buys subscription
  ↓
purchaseSubscriptionForSuplify creates UserSubscription
  (status: processing, isAutoRenewed: true, billingCycle: 0, cancelledAtPeriodEnd: false)
  ↓
Stripe checkout session created with metadata
  ↓
User completes payment
  ↓
checkout.session.completed fires → handlePaymentSucceeded()
  ↓
✅ Retrieves subscription from Stripe with expanded latest_invoice
✅ Calculates dates (expirationDate = subscriptionStartDate + 1 month)
✅ Creates PaymentTransaction
✅ Updates UserSubscription → active
✅ Updates user's subscriptionType and hasUsedFreeTrial
✅ Sets cancelledAtPeriodEnd: false (prevents cron cancellation)
✅ Sends admin notification
  ↓
invoice.payment_succeeded fires (subscription_create) → SKIPPED (already handled)
customer.subscription.created → SKIPPED (dates already set)
```

---

## Webhook Event Flow

| Event | Handler | Action |
|-------|---------|--------|
| `checkout.session.completed` | `handlePaymentSucceeded` | ✅ Creates PaymentTransaction, activates UserSubscription, updates user |
| `customer.subscription.created` | (skipped) | ⏭️ Dates already set in checkout handler |
| `invoice.payment_succeeded` (subscription_create) | `handleSuccessfulPayment` | ⏭️ Skipped - already handled in checkout |
| `invoice.payment_succeeded` (subscription_cycle) | `handleSuccessfulPayment` | ✅ Handles recurring payments, extends expirationDate |
| `customer.subscription.deleted` | `handleSubscriptionCancellation` | ✅ Handles user-initiated cancellations |
| `invoice.payment_failed` | `handleFailedPayment` | ✅ Sets status to past_due |

---

## Key Changes Summary

| File | Change |
|------|--------|
| `handlePaymentSucceeded.ts` | Added UserSubscription purchase handling with proper date calculation, imports, user update |
| `handleSuccessfulPayment.ts` | Skip `subscription_create` (handled in checkout), validate subscription ID retrieval |
| `webhookHandler.ts` | Skip `customer.subscription.created` and `customer.subscription.updated` to avoid duplicate processing |
| `subscriptionPlan.service.ts` | Set `isAutoRenewed: true` and `billingCycle: 0` on UserSubscription creation |
| `userSubscription.model.ts` | Fix pre-save hook to not auto-expire when dates are null |
| `userSubscription.cron.ts` | Exclude auto-renewing subscriptions from expiration check |
