import { Model, Types } from 'mongoose';


import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { OrderStatus, OrderType, PAYMENT_METHOD, PAYMENT_STATUS, TOrderRelatedTo } from './order.constant';

export interface IOrder {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId : Types.ObjectId; //🔗
  
  // orderType : OrderType.premium;// not sure

  orderRelatedTo : TOrderRelatedTo.product ;
        
  status : OrderStatus.pending | 
                OrderStatus.processing | 
                OrderStatus.complete | 
                OrderStatus.failed | 
                OrderStatus.refunded | 
                OrderStatus.cancelled;

  shippingAddress : String;
  // deliveryCharge : Number; //⚡ from kappes
  finalAmount : Number;
  paymentMethod :  PAYMENT_METHOD.online;

  PaymentTransactionId : Types.ObjectId; //🔗 

  paymentStatus : PAYMENT_STATUS.unpaid |
    PAYMENT_STATUS.paid|
    PAYMENT_STATUS.refunded ;

  orderNotes : string;
  
  isDeleted : Boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderModel extends Model<IOrder> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IOrder>>;
}