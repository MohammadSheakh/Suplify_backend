import { Model, Types, Schema } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TPaymentGateway, TPaymentStatus, TTransactionFor } from './paymentTransaction.constant';
import { TCurrency } from '../../../enums/payment';

export interface IPaymentTransaction {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId: Types.ObjectId; //🔗
  referenceFor :  TTransactionFor.DoctorPatientScheduleBooking |
          TTransactionFor.Order |
          TTransactionFor.LabTestBooking |
          TTransactionFor.UserSubscription | // previously it was SubscriptionPlan
          TTransactionFor.TrainingProgramPurchase |
          TTransactionFor.SpecialistPatientScheduleBooking;
  referenceId: Types.ObjectId; //🔗
  /**********
     * 
     * const refModel = mongoose.model(result.type);
     * const isExistRefference = await refModel.findById(result.refferenceId).session(session);
     * ********** */
  paymentGateway: TPaymentGateway.none |
                TPaymentGateway.paypal |
                TPaymentGateway.stripe;
  transactionId : string; // from kappes
  paymentIntent : string; // from kappes

  amount: number;
  currency : TCurrency.eur | TCurrency.usd
  paymentStatus : TPaymentStatus.pending | 
    TPaymentStatus.processing |
    TPaymentStatus.completed |
    TPaymentStatus.failed |
    TPaymentStatus.refunded |
    TPaymentStatus.cancelled |
    TPaymentStatus.partially_refunded |
    TPaymentStatus.disputed;

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