import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../../types/paginate';

export interface IUserLifeStyleChanges {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId : Types.ObjectId; // | undefined;
  lifeStyleChangesId : Types.ObjectId; // | undefined;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IuserLifeStyleChangesModel extends Model<IUserLifeStyleChanges> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IUserLifeStyleChanges>>;
}
