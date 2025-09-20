import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface ISuggestionBySpecialist {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId: Types.ObjectId;
  keyPoint : String;
  solutionName : String;
  suggestFromStore : String;
  createdBy : Types.ObjectId;  //🔗 Specialist Id 

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISuggestionBySpecialistModel extends Model<ISuggestionBySpecialist> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ISuggestionBySpecialist>>;
}