import { Model, Types } from 'mongoose';

import { OrderStatus, OrderType } from './suplifyStore.constant';
import { PaginateOptions, PaginateResult } from '../../types/paginate';

export interface ISuplifyStore {
   // 🔥🔥 Update korte hobe full Schema ..
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId : Types.ObjectId;
  totalAmount: Number;
  orderType : OrderType.premium;
  orderStatus : OrderStatus.pending | 
                OrderStatus.processing | 
                OrderStatus.complete | 
                OrderStatus.failed | 
                OrderStatus.refunded;
  orderNotes : string;
  isDeleted : Boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISuplifyStoreModel extends Model<ISuplifyStore> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ISuplifyStore>>;
}