import { Model, Types } from 'mongoose';

import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IGroceryList {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId: Types.ObjectId;
  productId : Types.ObjectId;
  name: string;
  description: string; // Required field for task description
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGroceryListModel extends Model<IGroceryList> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IGroceryList>>;
}
