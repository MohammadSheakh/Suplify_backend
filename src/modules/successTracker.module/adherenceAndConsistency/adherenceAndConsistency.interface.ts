import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface IAdherenceAndConsistency {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  didYouTakeSupplimentsAsRecommended: Number;
  howManyMealsDidYouFollow : Number;

  workoutDidYouCompleteThisWeek : Number;
  howConsistentWithHydration : Number;
  checkInWithCoachThisWeek : Boolean;

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdherenceAndConsistencyModel extends Model<IAdherenceAndConsistency> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IAdherenceAndConsistency>>;
}