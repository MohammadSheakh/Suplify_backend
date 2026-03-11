import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../types/paginate';


export interface IClientDocuments {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  title : string;
  description : string;
  attachments: Types.ObjectId[];
  patientId: Types.ObjectId;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IClientDocumentsModel extends Model<IClientDocuments> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IClientDocuments>>;
}