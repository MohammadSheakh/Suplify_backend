//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IDoctorSpecialistPatient {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  patientId: Types.ObjectId;
  specialistId : Types.ObjectId;
  doctorId : Types.ObjectId;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDoctorSpecialistPatientModel extends Model<IDoctorSpecialistPatient> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IDoctorSpecialistPatient>>;
}