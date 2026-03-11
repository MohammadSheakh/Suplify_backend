//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IHireSpecialistRequestToAdmin {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  patientId: Types.ObjectId;
  specialistId : Types.ObjectId;
  status : string;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHireSpecialistRequestToAdminModel extends Model<IHireSpecialistRequestToAdmin> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IHireSpecialistRequestToAdmin>>;
}