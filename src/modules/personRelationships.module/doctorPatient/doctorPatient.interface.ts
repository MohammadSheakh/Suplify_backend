//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TRelationCreatedBy } from '../doctorSpecialistPatient/doctorSpecialistPatient.constant';


export interface IDoctorPatient {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  patientId: Types.ObjectId;
  doctorId : Types.ObjectId;
  extraNote : string; // doctor create extra note
  relationCreatedBy : TRelationCreatedBy;
  
  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDoctorPatientModel extends Model<IDoctorPatient> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IDoctorPatient>>;
}