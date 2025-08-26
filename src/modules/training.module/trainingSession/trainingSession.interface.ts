import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface ITrainingSession {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  trainingProgramId: Types.ObjectId;
  sessionCount : Number;
  title : String;
  duration : String;
  benefits : String[];
  tokenCount : Number;

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITrainingSessionModel extends Model<ITrainingSession> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ITrainingSession>>;
}