import { Model, Types } from 'mongoose';


import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { UserSubscriptionStatusType } from './userSubscription.constant';

export interface IUserSubscription {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId :  Types.ObjectId; //🔗
  subscriptionPlanId: Types.ObjectId; //🔗
  subscriptionStartDate : Date;
  currentPeriodStartDate : Date;
  expirationDate : Date;
  renewalDate : Date;
  billingCycle: number;
  isAutoRenewed : boolean;
  cancelledAt :  Date ;
  cancelledAtPeriodEnd : boolean;
  status :
          UserSubscriptionStatusType.active | 
          UserSubscriptionStatusType.past_due | 
          UserSubscriptionStatusType.cancelled | 
          UserSubscriptionStatusType.unpaid | 
          UserSubscriptionStatusType.incomplete | 
          UserSubscriptionStatusType.incomplete_expired | 
          UserSubscriptionStatusType.trialing;
  
  stripe_subscription_id : string; // 🟢🟢 for recurring payment 
  stripe_transaction_id : string; // 🟢🟢 for one time payment
  // stripe_customer_id : String; // main user collection e rakhte hobe .. 

  isActive : boolean;

  isDeleted : boolean;
  createdAt?: Date;
  updatedAt?: Date;
 }

export interface IUserSubscriptionModel extends Model<IUserSubscription> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
    ) => Promise<PaginateResult<IUserSubscription>>;
}