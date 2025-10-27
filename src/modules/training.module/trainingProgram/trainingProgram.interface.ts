//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface ITrainingProgram {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  programName : String;
  description: String;
  durationInMonths : Number;
  totalSessionCount : Number;
  price : Number;
  createdBy : Types.ObjectId;  //🔗
  attachments: Types.ObjectId[];  //🔗🖼️
  trailerContents: Types.ObjectId[];  //🔗🖼️

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITrainingProgramModel extends Model<ITrainingProgram> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ITrainingProgram>>;
}