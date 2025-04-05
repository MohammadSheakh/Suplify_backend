import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IWellnessProduct {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  name : String;
  description: String;
  category : String;
  type :String;
  price : Number;
  stockQty: Number;
  isDeleted : Boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWellnessProductModel extends Model<IWellnessProduct> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IWellnessProduct>>;
}