//@ts-ignore
import { model, Schema } from 'mongoose';
import { ISpecialistPatientScheduleBooking, ISpecialistPatientScheduleBookingModel } from './specialistPatientScheduleBooking.interface';
import paginate from '../../../common/plugins/paginate';
import { TPaymentStatus, TScheduleBookingStatus } from './specialistPatientScheduleBooking.constant';
import { PaymentMethod } from '../../order.module/order/order.constant';

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
    specialistId: { //🔗🔥🔥🔥 will provides significant performance and functionality benefits
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'specialistId is required'],
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
      //---------------------------------
      // Initially status should be pending ..
      // In webhook .. update the status based on the payment status
      //---------------------------------

    },
    paymentTransactionId: { //🔗 Same as PaymentId of kappes
      type: Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
      default: null,
      
      //---------------------------------
      // In webhook we update this ..
      // Initially this should be null
      //---------------------------------

    },
    paymentMethod: {
      type: String,
      enum: PaymentMethod,
      // default: PaymentMethod.online,
    },
    price : {
      type: Number,
      required: [true, 'price is required'],
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

      //---------------------------------
      // Initially This should be unpaid ..
      // In webhook we update this as paid ..
      //---------------------------------

    },
    scheduleDate: {
      type: Date,
      required: [true, 'scheduleDate is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'startTime is required . type is Date'],
    },
    endTime: {
      type: Date,
      required: [true, 'endTime is required . type is Date'],
    },
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
