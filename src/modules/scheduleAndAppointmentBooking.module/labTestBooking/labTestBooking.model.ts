//@ts-ignore
import { model, Schema } from 'mongoose';
import { ILabTestBooking, ILabTestBookingModel } from './labTestBooking.interface';
import { PaymentMethod } from '../../order.module/order/order.constant';
import { TPaymentStatus } from '../specialistPatientScheduleBooking/specialistPatientScheduleBooking.constant';
import { TLabTestBookingStatus } from './labTestBooking.constant';
import paginate from '../../../common/plugins/paginate';

const LabTestBookingSchema = new Schema<ILabTestBooking>(
  {
    patientId: {//🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    labTestId: { //🔗 Actually Store er ekta Product er Id.. 
      // As Lab Test gulao amra store e rakhtesi .. 
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'labTestId is required'],
    },
    appointmentDate : {
      type: Date,
      required: [true, 'appointmentDate is required'],
    },
    startTime: { // Previously it was string
      type: Date,
      required: [true, 'startTime is required'],
    },
    endTime:{ // Previously it was string
      type : Date,
      required: [true, 'endTime is required'],
    },
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
      enum: [
        TLabTestBookingStatus.pending,
        TLabTestBookingStatus.confirmed,
        TLabTestBookingStatus.canceled,
        TLabTestBookingStatus.completed
      ],
      required: [true, `status is required .. it can be  ${Object.values(TLabTestBookingStatus).join(
        ', '
      )}`],
      default: TLabTestBookingStatus.pending,
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
    paymentStatus : {
      type: String,
      enum: [
        TPaymentStatus.unpaid,
        TPaymentStatus.paid,
        TPaymentStatus.refunded,
        TPaymentStatus.failed
      ],
      default: TPaymentStatus.unpaid,
      required: [true, `paymentStatus is required .. it can be  ${Object.values(TPaymentStatus).join(
              ', '
            )}`],
      //---------------------------------
      // Initially This should be unpaid .. In webhook we update this as paid .. 
      //---------------------------------
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
