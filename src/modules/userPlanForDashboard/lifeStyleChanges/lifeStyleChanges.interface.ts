import { Model, Types } from 'mongoose';

import {
  LifeStyleChangesCategoryType,
  LifeStyleChangesTypeType,
} from './lifeStyleChanges.constant';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface ILifeStyleChanges {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  title: string;
  attachments: Types.ObjectId[];
  description: string; // Required field for task description
  category?:
    | LifeStyleChangesCategoryType.normal
    | LifeStyleChangesCategoryType.specialized; // Enum for task status
  type?: LifeStyleChangesTypeType.free | LifeStyleChangesTypeType.paid; // Enum for task status
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IlifeStyleChangesModel extends Model<ILifeStyleChanges> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ILifeStyleChanges>>;
}
