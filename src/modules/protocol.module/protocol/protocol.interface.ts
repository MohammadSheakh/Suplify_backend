import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface IProtocol {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  createdBy: Types.ObjectId; //🔗 
  name : String;
  totalPlan : number;
  patientId: Types.ObjectId; //🔗 
  
  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProtocolModel extends Model<IProtocol> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IProtocol>>;
}