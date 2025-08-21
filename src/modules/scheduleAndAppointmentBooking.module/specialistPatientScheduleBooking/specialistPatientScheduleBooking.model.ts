import { model, Schema } from 'mongoose';
import { ISpecialistPatientScheduleBooking, ISpecialistPatientScheduleBookingModel } from './specialistPatientScheduleBooking.interface';
import paginate from '../../../common/plugins/paginate';
import { TSpecialistWorkoutClassSchedule } from '../specialistWorkoutClassSchedule/specialistWorkoutClassSchedule.constant';
import { TAppointmentStatus } from '../doctorPatientScheduleBooking/doctorPatientScheduleBooking.constant';
import { TPaymentStatus, TScheduleBookingStatus } from './specialistPatientScheduleBooking.constant';
import { PAYMENT_METHOD } from '../../order.module/order/order.constant';

const SpecialistPatientScheduleBookingSchema = new Schema<ISpecialistPatientScheduleBooking>(
  {
    patientId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    workoutClassScheduleId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'SpecialistWorkoutClassSchedule',
      required: [true, 'workoutClassScheduleId is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
    status: {
      type : String,
      enum: [
        TScheduleBookingStatus.pending,
        TScheduleBookingStatus.cancelled,
        TScheduleBookingStatus.scheduled,
        TScheduleBookingStatus.completed
      ],
      // default: TScheduleBookingStatus.scheduled,
      required: [true, 'status is required'],
    },
    PaymentTransactionId: { //🔗 Same as PaymentId of kappes
      type: Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD,
      // default: PAYMENT_METHOD.online,
    },
    paymentStatus : {
      type: String,
      enum: [
        TPaymentStatus.unpaid,
        TPaymentStatus.paid,
        TPaymentStatus.refunded,
        TPaymentStatus.failed
      ],
      // default: TPaymentStatus.UNPAID,
      required: [true, 'paymentStatus is required'],
    }
  },
  { timestamps: true }
);

SpecialistPatientScheduleBookingSchema.plugin(paginate);

SpecialistPatientScheduleBookingSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
SpecialistPatientScheduleBookingSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._SpecialistPatientScheduleBookingId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const SpecialistPatientScheduleBooking = model<
  ISpecialistPatientScheduleBooking,
  ISpecialistPatientScheduleBookingModel
>('SpecialistPatientScheduleBooking', SpecialistPatientScheduleBookingSchema);
