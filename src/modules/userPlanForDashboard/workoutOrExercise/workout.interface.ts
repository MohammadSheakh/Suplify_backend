import { Model, Types } from 'mongoose';
import { WorkoutCategoryType, WorkoutTypeType } from './workout.constant';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IWorkout {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  title: string;
  attachments: Types.ObjectId[];
  description: string; // Required field for task description
  category?: WorkoutCategoryType.normal | WorkoutCategoryType.specialized; // Enum for task status
  type?: WorkoutTypeType.free | WorkoutTypeType.paid; // Enum for task status
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IworkoutModel extends Model<IWorkout> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IWorkout>>;
}
