import { Model, Types } from 'mongoose';

import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IMeal {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  title: string;
  attachments: Types.ObjectId[];
  description: string; // Required field for task description
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ImealModel extends Model<IMeal> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IMeal>>;
}
