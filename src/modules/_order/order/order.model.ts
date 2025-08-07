import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import {
  OrderStatus,
  OrderType,
  TOrderRelatedTo,
} from './order.constant';
import { IOrder, IOrderModel } from './order.interface';

const orderSchema = new Schema<IOrder>(
  {
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User Id is required'],
    },
    totalAmount: {
      type : Number,
      required : [true, 'totalAmount is needed']
    },
    orderRelatedTo : {
      type : String,
      enum : [
        TOrderRelatedTo.product,
        TOrderRelatedTo.labTest,
        TOrderRelatedTo.appointment,
        TOrderRelatedTo.trainingProgram,
        TOrderRelatedTo.workoutClass,
        TOrderRelatedTo.subscription,
      ],
      required: [
        true,
        `orderType is required it can be ${Object.values(
          OrderType
        ).join(', ')}`,
      ],
    },
    orderStatus: {
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
    },
    
    orderNotes: {
      //> One Subscription can have multiple features ...
      type: String,
      required: [false, 'orderNotes is not required'],
    },

    PaymentTransactionId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD,
      default: PAYMENT_METHOD.ONLINE,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: PAYMENT_STATUS.UNPAID,
    },

    /***********
     * 
     * Need to check this ... TODO : 
     * 
     * ********** */
    isPaymentTransferdToVendor: {
      type: Boolean,
      default: false,
    },
    /***************
     * 
     * Shipping Address must add kora lagbe .. 
     * 
     * ********** */
    shippingAddress: {
      type: String,
      required: true,
    },
    isNeedRefund: {
      type: Boolean,
      default: false,
    },
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
