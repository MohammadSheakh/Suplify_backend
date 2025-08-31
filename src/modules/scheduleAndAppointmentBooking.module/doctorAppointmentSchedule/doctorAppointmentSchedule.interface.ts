import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TDoctorAppointmentScheduleStatus } from './doctorAppointmentSchedule.constant';


export interface IDoctorAppointmentSchedule {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  createdBy: Types.ObjectId;
  scheduleName : string;
  scheduleDate : Date; // TODO : is it should be string or Date 
  startTime : string;
  endTime : string;
  description : string;
  price : string;
  typeOfLink : string;
  meetingLink : string;
  scheduleStatus?: TDoctorAppointmentScheduleStatus.available
  | TDoctorAppointmentScheduleStatus.booked
  | TDoctorAppointmentScheduleStatus.cancelled;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDoctorAppointmentScheduleModel extends Model<IDoctorAppointmentSchedule> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IDoctorAppointmentSchedule>>;
}