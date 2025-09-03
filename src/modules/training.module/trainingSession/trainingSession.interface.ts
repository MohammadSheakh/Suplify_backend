//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TDurationUnit } from './trainingSession.constant';


export interface ITrainingSession {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  trainingProgramId: Types.ObjectId;
  sessionCount : number;
  title : string;
  duration : string;
  durationUnit: TDurationUnit.hours | TDurationUnit.minutes;
  benefits : string[];
  tokenCount : number;
  coverPhotos : Types.ObjectId[];
  attachments : Types.ObjectId[];
  external_link : string;
  trailerContent: Types.ObjectId[];

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