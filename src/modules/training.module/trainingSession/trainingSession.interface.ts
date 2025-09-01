//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface ITrainingSession {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  trainingProgramId: Types.ObjectId;
  sessionCount : number;
  title : string;
  duration : string;
  benefits : string[];
  tokenCount : number;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITrainingSessionModel extends Model<ITrainingSession> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ITrainingSession>>;
}