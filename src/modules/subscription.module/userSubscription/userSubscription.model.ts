import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import { UserSubscriptionStatusType } from './userSubscription.constant';
import {
  IUserSubscription,
  IUserSubscriptionModel,
} from './userSubscription.interface';
import { User } from '../../user/user.model';

const userSubscriptionSchema = new Schema<IUserSubscription>(
  {
    userId: {
      //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [false, 'User Id is required'],
    },
    subscriptionPlanId: {
      //🔗
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: [false, 'Subscription Plan Id is required'],
    },
    subscriptionStartDate: {
      type: Date,
      required: true,
      validate: {
        validator: value => value <= new Date(),
        message: 'Subscription Start Date must be in the past',
      },
    },
    currentPeriodStartDate: {
      // renewal period end date
      type: Date,
      required: false,
    },
    // renewalDate is not expiration date
    expirationDate: {
      type: Date,
      required: false,
      
    },

    renewalDate: {
      type: Date,
      required: false,
      
    },
    
    billingCycle: {
      type: Number,
      required: [true, 'billingCycle is required'],
      default: 0,
    },
    isAutoRenewed: {
      type: Boolean,
      required: [false, 'isAutoRenewed is not required'],
      default: false,
    },
    cancelledAt: {
      type: Date,
      required: [false, 'cancelledAt is not required'],
      default: null,
    },
    cancelledAtPeriodEnd: {
      type: Boolean,
      required: [false, 'cancelledAtPeriodEnd is not required'],
      default: false,
    },
    status: {
      type: String,
      enum: [
        UserSubscriptionStatusType.processing,
        UserSubscriptionStatusType.active,
        UserSubscriptionStatusType.past_due,
        UserSubscriptionStatusType.cancelled,
        UserSubscriptionStatusType.unpaid,
        UserSubscriptionStatusType.incomplete,
        UserSubscriptionStatusType.incomplete_expired,
        UserSubscriptionStatusType.trialing,
      ],
      required: [
        true,
        `status is required .. It can be  ${Object.values(
          UserSubscriptionStatusType
        ).join(', ')}`,
      ],
    },
    isFromFreeTrial :{
      /******
       * by this we can track is this subscription
       * from free trial or not
       * 
       * true hoile amader ke
       * Standard Subscription 
       * ta assign kore dite hobe
       * 
       * ****** */
      type: Boolean,
      required:[true, 'isFromFreeTrial is required']
    },
    stripe_subscription_id: { 
      type: String,
      required: [false, 'stripe_subscription_id is not required'], // 🟢🟢 for recurring payment 
      // default: null,
    },

    stripe_transaction_id : {
      type: String,
      required: [false, 'stripe_transaction_id is not required'], // 🟢🟢 for one time payment
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { 
    timestamps: true,
   }
);

userSubscriptionSchema.plugin(paginate);

// auto calculate the renewal date if its not provided ...
userSubscriptionSchema.pre('save', function (next) {
  // Rename _id to _projectId
  //this._taskId = this._id;
  //this._id = undefined;  // Remove the default _id field

  if (!this.renewalDate) {
    const renewalPeriods = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };

    this.renewalDate = new Date(this.subscriptionStartDate);
    this.renewalDate.setDate(
      this.renewalDate.getDate() + renewalPeriods[this.renewalFrequncy]
    );
  }

  // auto update the status if  renewal date has passed
  if (this.renewalDate < new Date()) {
    this.status = UserSubscriptionStatusType.expired;
  }

  next();
});

// Use transform to rename _id to _projectId
userSubscriptionSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._userSubscriptionId = ret._id; // Rename _id to _userSubscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const UserSubscription = model<
  IUserSubscription,
  IUserSubscriptionModel
>('UserSubscription', userSubscriptionSchema);
