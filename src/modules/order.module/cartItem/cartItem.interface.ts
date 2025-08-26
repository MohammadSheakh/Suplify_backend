import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface ICartItem {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  cartId: Types.ObjectId; //🔗
  itemId :  Types.ObjectId; //🔗
  quantity : Number;
  
  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateCart{
  itemId: Types.ObjectId;
}

export interface ICartItemModel extends Model<ICartItem> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ICartItem>>;
}