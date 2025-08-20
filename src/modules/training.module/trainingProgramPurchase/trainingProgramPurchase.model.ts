import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import { ITrainingProgramPurchase, ITrainingProgramPurchaseModel } from './trainingProgramPurchase.interface';
import { PAYMENT_METHOD } from '../../order.module/order/order.constant';
import { TPaymentStatus } from '../../scheduleAndAppointmentBooking.module/specialistPatientScheduleBooking/specialistPatientScheduleBooking.constant';


const TrainingProgramPurchaseSchema = new Schema<ITrainingProgramPurchase>(
  {
    trainingProgramId : { //🔗 which training program 
      type: Schema.Types.ObjectId,
      ref: 'TrainingProgram',
    },
    patientId : { //🔗 who purchase this
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    PaymentTransactionId: { //🔗 Same as PaymentId of kappes
      type: Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD,
      default: PAYMENT_METHOD.online,
    },
    paymentStatus : {
      type: String,
      enum: [
        TPaymentStatus.UNPAID,
        TPaymentStatus.PAID,
        TPaymentStatus.REFUNDED,
        TPaymentStatus.CANCELLED
      ],
      default: TPaymentStatus.UNPAID,
      required: [true, 'paymentStatus is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

TrainingProgramPurchaseSchema.plugin(paginate);

TrainingProgramPurchaseSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
TrainingProgramPurchaseSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._TrainingProgramPurchaseId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const TrainingProgramPurchase = model<
  ITrainingProgramPurchase,
  ITrainingProgramPurchaseModel
>('TrainingProgramPurchase', TrainingProgramPurchaseSchema);
