import { Model, Types, Schema } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TPaymentGateway, TPaymentStatus, TTransactionFor } from './paymentTransaction.constant';
import { CurrencyType } from '../../subscription.module/subscriptionPlan/subscriptionPlan.constant';

export interface IPaymentTransaction {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  paymentMethodId: Types.ObjectId; // INFO : persons card information .. no need to add reference here .. 
  type : TTransactionFor.order | TTransactionFor.subscription;
  subscriptionId : Types.ObjectId;
  paymentGateway: TPaymentGateway.none | TPaymentGateway.paypal | TPaymentGateway.stripe;
  transactionId : String;
  paymentIntent : String; // this is also an Id

  amount: number;
  currency : CurrencyType.EUR | CurrencyType.USD
  paymentStatus : TPaymentStatus.pending | 
    TPaymentStatus.processing |
    TPaymentStatus.completed |
    TPaymentStatus.failed |
    TPaymentStatus.refunded |
    TPaymentStatus.cancelled |
    TPaymentStatus.partially_refunded |
    TPaymentStatus.disputed;

    description: string;

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
    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPaymentTransactionModel extends Model<IPaymentTransaction> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IPaymentTransaction>>;
}