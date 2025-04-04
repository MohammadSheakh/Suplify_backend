import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import { UserSubscriptionStatusType } from './userSubscription.constant';
import { IUserSubscription, IUserSubscriptionModel } from './userSubscription.interface';
import { RenewalFrequncyType } from '../subscription/subscription.constant';

const userSubscriptionSchema = new Schema<IUserSubscription>(
  {
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [false, 'User Id is required'],
    },
    subscriptionId: { //🔗
        type: Schema.Types.ObjectId,
        ref: 'Subscription',
        required: [false, 'Subscription Id is required'],
      },
    subscriptionStartDate : {
        type: Date,
        required: true,
        validate : {
          validator : (value) => value <=  new Date(),
          message : 'Subscription Start Date must be in the past'
        }
    },
    renewalDate : {
        type: Date,
        required: true,
        validate:{
          validator: function (value) {
            return value > this.subscriptionStartDate;
          }, 
          message : 'initial Period End Date must be after subscription start date ', 
        },
    },
    currentPeriodStartDate : { // renewal period end date
        type: Date,
        required: true,
    },

    renewalFrequncy: {
          type: String,
          enum: [
            RenewalFrequncyType.daily,
            RenewalFrequncyType.weekly,
            RenewalFrequncyType.monthly,
            RenewalFrequncyType.yearly,
          ],
          default: RenewalFrequncyType.monthly,
          required: [
            true,
            `Renewal Frequncy is required .. It can be  ${Object.values(
              RenewalFrequncyType
            ).join(', ')}`,
          ],
        },
    isActive : {
      type: Boolean,
      required: [false, 'isActive is not required'],
      default: true,
    },
    isAutoRenewed : {
      type: Boolean,
      required: [false, 'isAutoRenewed is not required'],
      default: true,
    },
    status : {
        type: String,
        enum : [
            UserSubscriptionStatusType.active,
            UserSubscriptionStatusType.expired,
            UserSubscriptionStatusType.cancelled,	
        ],
        required: [true, 'status is required'],
    },
    billingCycle : {
        type : Number,
        required: [true, 'billingCycle is required'],
        default : 1,
    },
    currentBillingAmount : {
        //> 🚧  eta ki rakhar dorkar ache ? 
        type : Number,
        required: [true, 'currentBillingAmount is required'],
        default : 0,
    }
    ,
    cancelledAt : {
        type: Date,
        required: [false, 'cancelledAt is not required'],
        default: null,
    },
    stripe_subscription_id : {
        type: String,
        required: [false, 'stripe_subscription_id is not required'],
        default: null,
    },
    external_customer_id : {
        // > stripe er customer id ...
        type: String,
        required: [false, 'stripe_customer_id or external_customer_id is not required'],
        default: null,
    },
    isDeleted : {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

userSubscriptionSchema.plugin(paginate);

// auto calculate the renewal date if its not provided ... 
userSubscriptionSchema.pre('save', function(next) {
  // Rename _id to _projectId
  //this._taskId = this._id;
  //this._id = undefined;  // Remove the default _id field

  if(!this.renewalDate){
    const renewalPeriods = {
      daily: 1,
      weekly : 7,
      monthly: 30, 
      yearly : 365 
    }

    this.renewalDate = new Date(this.subscriptionStartDate);
    this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.renewalFrequncy])
  }

  // auto update the status if  renewal date has passed 
  if(this.renewalDate < new Date()){
    this.status = UserSubscriptionStatusType.expired
  }

  next();
});


// Use transform to rename _id to _projectId
userSubscriptionSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._userSubscriptionId = ret._id;  // Rename _id to _userSubscriptionId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});


export const UserSubscription = model<IUserSubscription, IUserSubscriptionModel>(
  'UserSubscription',
  userSubscriptionSchema
);
