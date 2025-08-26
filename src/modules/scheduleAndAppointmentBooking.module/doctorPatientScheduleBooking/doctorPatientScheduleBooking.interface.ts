import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface IDoctorPatientScheduleBooking {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId: Types.ObjectId;
  message : String;

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDoctorPatientScheduleBookingModel extends Model<IDoctorPatientScheduleBooking> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IDoctorPatientScheduleBooking>>;
}