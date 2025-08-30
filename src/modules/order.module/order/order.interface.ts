import { Model, Types } from 'mongoose';


import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { OrderStatus, OrderType, PaymentMethod, PaymentStatus, TOrderRelatedTo } from './order.constant';

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
  paymentMethod :  PaymentMethod.online;

  paymentTransactionId : Types.ObjectId; //🔗 

  paymentStatus : PaymentStatus.unpaid |
    PaymentStatus.paid|
    PaymentStatus.refunded ;

  orderNotes : string;
  
  isDeleted : Boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateOrder{
  cartId: Types.ObjectId;
  address: string;
  city: string;
  state : string;
  zipCode : string;
  country : string;
}

export interface ICartItem{
  // _id: Types.ObjectId;
  cartId: Types.ObjectId;
  itemId: Types.ObjectId | {
    _id: Types.ObjectId;
    name: string;
    price: number;
  };
  quantity: number;
}

export interface IOrderModel extends Model<IOrder> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IOrder>>;
}