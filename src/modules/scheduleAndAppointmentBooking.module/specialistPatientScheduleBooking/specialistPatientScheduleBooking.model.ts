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
      required: [true, 'patientId is required'],
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
      required: [true, `status is required .. it can be  ${Object.values(TScheduleBookingStatus).join(
              ', '
            )}`],
       /**************
       * Initially status should be pending ..
       * In webhook .. update the status based on the payment status
       **************/
    },
    PaymentTransactionId: { //🔗 Same as PaymentId of kappes
      type: Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
      default: null,
      /*********
       * In webhook we update this ..
       * Initially this should be null
       *********/
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
      required: [true, `paymentStatus is required .. it can be  ${Object.values(TPaymentStatus).join(
              ', '
            )}`],

      /********
       * Initially This should be unpaid ..
       *
       * In webhook we update this as paid ..
       ********/
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
