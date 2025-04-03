import { model, Schema } from 'mongoose';
import {  ITrainingSession, ITrainingSessionModel } from './trainingSession.interface';
import { TrainingSessionStatus } from './trainingSession.constant';
import { TrainingProgramCategory, TrainingProgramType } from '../trainingProgram/trainingProgram.constant';
import paginate from '../../../common/plugins/paginate';
import { UserSubscriptionStatusType } from './userSubscription.constant';

const userSubscriptionSchema = new Schema<IUserSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [false, 'User Id is required'],
    },
    subscriptionId: {
        type: Schema.Types.ObjectId,
        ref: 'Subscription',
        required: [false, 'Subscription Id is required'],
      },
    subscriptionStartDate : {
        type: Date,
        required: true,
    },
    initialPeriodEndDate : {
        type: Date,
        required: true,
    },
    currentPeriodEndDate : { // renewal period end date
        type: Date,
        required: true,
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

// taskSchema.pre('save', function(next) {
//   // Rename _id to _projectId
//   this._taskId = this._id;
//   this._id = undefined;  // Remove the default _id field
//   next();
// });


// Use transform to rename _id to _projectId
userSubscriptionSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._trainingSessionId = ret._id;  // Rename _id to _projectId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});


export const UserSubscription = model<IUserSubscription, IUserSubscriptionModel>(
  'UserSubscription',
  userSubscriptionSchema
);
