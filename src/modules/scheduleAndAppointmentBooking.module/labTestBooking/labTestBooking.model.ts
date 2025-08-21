import { model, Schema } from 'mongoose';
import paginate from '../../common/plugins/paginate';
import { ILabTestBooking, ILabTestBookingModel } from './LabTestBooking.interface';
import { PAYMENT_METHOD } from '../../order.module/order/order.constant';
import { TPaymentStatus } from '../specialistPatientScheduleBooking/specialistPatientScheduleBooking.constant';

const LabTestBookingSchema = new Schema<ILabTestBooking>(
  {
    patientId: {//🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    labTestId: { //🔗 Actually Store er ekta Product er Id.. 
      // As Lab Test gulao amra store e rakhtesi .. 
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    appointmentDate : {
      type: Date,
      required: [true, 'appointmentDate is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'startTime is required'],
    },
    endTime:{
      type : Date,
      required: [true, 'endTime is required'],
    },
    
    // useDifferentAddress:{ // as our system has no system to track user address .. every time user have to type address .. 
    //   type: Boolean,
    //   required: [true, 'useDifferentAddress is required'],
    //   default: false,
    // },

    address: {
      type:String,
      required: [true, 'address is required'],
    },  
    city : {
      type: String,
      required: [true, 'city is required'],
    },
    state : {
      type: String,
      required: [true, 'state is required'],
    },
    zipCode :{
      type: String,
      required: [true, 'zipCode is required'],
    },
    status:{ // 🟢🟢 need to think about this .. with UI
      type: String,
      enum: ['pending', 'confirmed', 'canceled'],
      default: 'pending',
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
      default: TPaymentStatus.unpaid,
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

LabTestBookingSchema.plugin(paginate);

LabTestBookingSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
LabTestBookingSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._LabTestBookingId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const LabTestBooking = model<
  ILabTestBooking,
  ILabTestBookingModel
>('LabTestBooking', LabTestBookingSchema);
