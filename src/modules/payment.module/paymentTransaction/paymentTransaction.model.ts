import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import { IPaymentTransaction, IPaymentTransactionModel } from './paymentTransaction.interface';
import { CurrencyType } from '../../subscription.module/subscriptionPlan/subscriptionPlan.constant';
import { TPaymentGateway, TPaymentStatus, TTransactionFor } from './paymentTransaction.constant';

const paymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // For product purchases
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: function() { return this.type.toString() === 'order'; }
    },
    /**********
    paymentMethodId: { // Persons Card Infomation.. But no need
      type: Schema.Types.ObjectId,
      ref: 'PaymentMethod',
      required: false
    },
    ********** */
    type: {
      type: String,
      enum: [
        TTransactionFor.order ,
        TTransactionFor.subscription
      ],
      required: true
    },
    // For subscription payments
    subscriptionId: {
      type: Schema.Types.ObjectId,
      // ref: 'UserSubscription',
      ref: 'Subscription',
      required: function() { return this.type.toString() === 'subscription'; } // 🔥🔥 bujhi nai 
    },

    paymentGateway: {
      type: String,
      enum: [
        TPaymentGateway.stripe,
        TPaymentGateway.paypal,
        TPaymentGateway.none
      ],
      required: true
    },
    
    /***************
    // External payment IDs
    // stripe_payment_intent_id /  paypal_transaction_id
    externalTransactionOrPaymentId: {
      type: String,
      required: 'true' 
    },
    ********************* */

    transactionId: { // from kappes
      type: String,
      default: null,
    },
    paymentIntent: { // from kappes
      type: String,
      default: null,
    },


    // stripe_payment_intent_id: {
    //   type: String,
    //   required: function() { return this.paymentProcessor === 'stripe'; }
    // },
    // paypal_transaction_id: {
    //   type: String,
    //   required: function() { return this.paymentProcessor === 'paypal'; }
    // },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be greater than zero']
    },
    currency: {
      type: String,
      enum: [CurrencyType.EUR , CurrencyType.USD],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: [
        TPaymentStatus.pending, // TODO : we need to add description for each of this
        TPaymentStatus.processing,
        TPaymentStatus.completed,
        TPaymentStatus.failed,
        TPaymentStatus.refunded,
        TPaymentStatus.cancelled,
        TPaymentStatus.partially_refunded,
        TPaymentStatus.disputed
      ],
      default: TPaymentStatus.pending
    },
    
    description: { // INFO : do we really need this?
      type: String,
      required: false
    },
    billingDetails: {
      name: String,
      email: String,
      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postal_code: String,
        country: String
      }
    },
    // metadata: {
    //   type: Map,
    //   of: String
    // },
    // refundDetails: [{
    //   amount: Number,
    //   reason: String,
    //   date: Date,
    //   refundId: String
    // }],
    gatewayResponse: { // from kappes
      type: Schema.Types.Mixed,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

paymentTransactionSchema.plugin(paginate);

paymentTransactionSchema.pre('save', function(next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field

  next();
});


// Use transform to rename _id to _projectId
paymentTransactionSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._paymentTransactionId = ret._id;  // Rename _id to _paymentTransactionId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});


export const PaymentTransaction = model<IPaymentTransaction, IPaymentTransactionModel>(
  'PaymentTransaction',
  paymentTransactionSchema
);
