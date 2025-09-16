//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TPlanByDoctor } from './planByDoctor.constant';


export interface IPlanByDoctor {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  planType: TPlanByDoctor;
  createdBy : Types.ObjectId; //🔗 doctorId
  protocolId: Types.ObjectId; //🔗 for which protocol
  title : string;
  description : string;
  keyPoints : string[];
  totalKeyPoints : number;
  patientId : Types.ObjectId; //🔗 for which patient
  
  isDeleted? : boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPlanByDoctorModel extends Model<IPlanByDoctor> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IPlanByDoctor>>;
}