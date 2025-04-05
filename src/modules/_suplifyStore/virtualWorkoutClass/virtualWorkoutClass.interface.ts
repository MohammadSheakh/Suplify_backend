import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IVirtualWorkoutClass {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  title : String;
  description: String;
  duration : String;
  specialistId : Types.ObjectId; // 🔗
  maxEnrollmentCapacity : Number;
  currentEnrollmentsCount : Number;
  price : number;
  difficultyLevel : String;
  category : String;
  isDeleted : boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVirtualWorkoutClassModel extends Model<IVirtualWorkoutClass> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IVirtualWorkoutClass>>;
}