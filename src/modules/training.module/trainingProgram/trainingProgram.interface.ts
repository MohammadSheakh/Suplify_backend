import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface ITrainingProgram {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  programName : String;
  durationInMonths : Number;
  totalSessionCount : Number;
  price : Number;
  createdBy : Types.ObjectId;  //🔗
  attachments: Types.ObjectId[];  // Array of attachment IDs
  trailerContents: Types.ObjectId[];  // Array of trailer content IDs

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