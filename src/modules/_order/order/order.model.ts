import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import {
  OrderStatus,
  OrderType,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  TOrderRelatedTo,
} from './order.constant';
import { IOrder, IOrderModel } from './order.interface';

const orderSchema = new Schema<IOrder>(
  {
    userId: { //🔗 who place the order
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User Id is required'],
    },
    orderRelatedTo : {
      type : String,
      enum : [
        TOrderRelatedTo.product,
        // TOrderRelatedTo.labTest,
        // TOrderRelatedTo.appointment,
        // TOrderRelatedTo.trainingProgram,
        // TOrderRelatedTo.workoutClass,
        // TOrderRelatedTo.subscription,
      ],
      required: [
        true,
        `orderType is required it can be ${Object.values(
          OrderType
        ).join(', ')}`,
      ],
    },
    status: { // ⚡
      type: String,
      enum: [
        OrderStatus.pending,
        OrderStatus.processing,
        OrderStatus.complete,
        OrderStatus.failed,
        OrderStatus.refunded,
        OrderStatus.cancelled,
      ],
      required: [
        true,
        `OrderStatus is required it can be ${Object.values(
          OrderStatus
        ).join(', ')}`,
      ],
      default: OrderStatus.pending,
    },

    shippingAddress: {
      type: String,
      required: true,
    },
    deliveryCharge: { // ⚡ from kappes
          type: Number,
          default: 0,
    },
    finalAmount: {
      type : Number,
      required : [true, 'totalAmount is needed']
    },

    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD,
      default: PAYMENT_METHOD.online,
    },

    PaymentTransactionId: { // Same as PaymentId of kappes
      type: Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: [
        PAYMENT_STATUS.unpaid,
        PAYMENT_STATUS.paid,
        PAYMENT_STATUS.refunded
      ],
      default: PAYMENT_STATUS.unpaid,
    },

    orderNotes: {
      type: String,
      required: [false, 'orderNotes is not required'],
    },
    

    /***********
     * 
     * Need to check this ... TODO : 
     * 
     * ********** */
    // isPaymentTransferdToVendor: {
    //   type: Boolean,
    //   default: false,
    // },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

orderSchema.plugin(paginate);

orderSchema.pre('save', function(next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee
  
  next();
});


// Use transform to rename _id to _projectId
orderSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._orderId = ret._id;  // Rename _id to _subscriptionId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});


export const Order = model<IOrder, IOrderModel>(
  'Order',
  orderSchema
);
