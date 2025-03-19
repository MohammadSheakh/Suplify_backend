import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../../types/paginate';

export interface IUserMealPlan {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId : Types.ObjectId; // | undefined;
  workoutId : Types.ObjectId; // | undefined;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IuserMealPlanModel extends Model<IUserMealPlan> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IUserMealPlan>>;
}
