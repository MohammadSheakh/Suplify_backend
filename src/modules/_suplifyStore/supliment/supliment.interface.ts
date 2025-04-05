import { Model, Types } from 'mongoose';


import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { OrderStatus, OrderType } from './supliment.constant';

export interface ISupliment {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  name : String;
  price: Number;
  description : String;
  stockQty : Number;
  ingredients : String;
  dosageInstruction : String;
  attachments : Types.ObjectId[]; // 🔗
  isDeleted : Boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISuplimentModel extends Model<ISupliment> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ISupliment>>;
}