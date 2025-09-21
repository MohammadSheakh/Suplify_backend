//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TMeetingLink, TSession, TSpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.constant';

export interface ISpecialistWorkoutClassSchedule {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  createdBy: Types.ObjectId; // Reference to a specialist (User)
  scheduleName: string;
  scheduleDate: Date;
  startTime: Date;
  endTime: Date;
  description: string;
  status:  TSpecialistWorkoutClassSchedule.available |
        TSpecialistWorkoutClassSchedule.booked |
        TSpecialistWorkoutClassSchedule.cancelled;
  price: number;
  typeOfLink: TMeetingLink.zoom | TMeetingLink.googleMeet | TMeetingLink.others;
  sessionType: TSession.private | TSession.group;
  meetingLink: string;

  isDeleted? : Boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISpecialistWorkoutClassScheduleModel extends Model<ISpecialistWorkoutClassSchedule> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ISpecialistWorkoutClassSchedule>>;
}