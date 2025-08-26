import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface ISuccessTracker {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  createdBy: Types.ObjectId;
  mindsetAndMomentumId: Types.ObjectId;
  satisfactionAndFeedbackId: Types.ObjectId;
  adherenceAndConsistencyId: Types.ObjectId;
  healthAndPerformanceId: Types.ObjectId;

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISuccessTrackerModel extends Model<ISuccessTracker> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ISuccessTracker>>;
}