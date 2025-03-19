import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../../types/paginate';

export interface IUserWorkout {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId : Types.ObjectId; // | undefined;
  workoutId : Types.ObjectId; // | undefined;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IuserWorkoutModel extends Model<IUserWorkout> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IUserWorkout>>;
}
