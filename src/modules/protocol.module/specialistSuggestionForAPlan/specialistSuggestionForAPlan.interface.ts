import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface ISpecialistSuggestionForAPlan {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId: Types.ObjectId;
  message : String;

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISpecialistSuggestionForAPlanModel extends Model<ISpecialistSuggestionForAPlan> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ISpecialistSuggestionForAPlan>>;
}