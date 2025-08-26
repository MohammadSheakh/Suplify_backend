import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
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
        `orderRelatedTo is required it can be ${Object.values(
          TOrderRelatedTo
        ).join(', ')}`,
      ],
    },
    status: { // ⚡
      type: String,
      enum: [
        OrderStatus.pending,  // Order placed, but no payment attempt yet.
        OrderStatus.processing,  // Payment is being attempted (checkout in progress).
        OrderStatus.confirmed, //Payment completed, order is confirmed, preparing for shipment.
        OrderStatus.completed, // Order delivered successfully, transaction closed
        OrderStatus.didNotReceived , // Delivery failed (lost, wrong address, courier issue, etc).
        OrderStatus.productReturned , // Customer returned the product (after delivery).
        OrderStatus.failed, // Payment attempt failed (insufficient funds, declined, etc).
        OrderStatus.refunded, // Refund processed (can come from didNotReceive, productReturned, or cancelled after payment)
        OrderStatus.cancelled, // User/admin cancelled before shipment.
      ],
      required: [
        true,
        `status is required it can be ${Object.values(
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
      enum: PaymentMethod,
      default: PaymentMethod.online,
      required: [
        true,
        `paymentMethod is required it can be ${Object.values(
          PaymentMethod
        ).join(', ')}`,
      ],
    },

    PaymentTransactionId: { //🔗 Same as PaymentId of kappes
      type: Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
      required: [true, 'PaymentTransactionId is required'],

      /**
       * 
       * we initially set this null ...
       * 
       * In webhook after payment suceessfull 
       * 
       * we set this .. 
       * 
       * */

    },

    paymentStatus: {
      type: String,
      enum: [
        PaymentStatus.unpaid,
        PaymentStatus.paid,
        PaymentStatus.refunded
      ],
      default: PaymentStatus.unpaid,
      required: [
        true,
        `paymentStatus is required it can be ${Object.values(
          PaymentStatus
        ).join(', ')}`,
      ],
      /*******
       * 
       * Initially unpaid .. 
       * 
       * in webhook handler .. we set this to paid .. 
       * 
       * ******* */
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
