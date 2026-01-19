//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TMeetingLink, TSession, TSpecialistWorkoutClassSchedule, TSpecialistWorkoutClassScheduleType } from './specialistWorkoutClassSchedule.constant';

export interface ISpecialistWorkoutClassSchedule {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  createdBy: Types.ObjectId; // Reference to a specialist (User)
  scheduleName: string;
  //🆕
  scheduleType: TSpecialistWorkoutClassScheduleType;

  // ONE_TIME
  scheduleDate: Date;

  // 🆕 REPEAT
  repeatRule : {
    weekDays : [string],
    startDate : Date,
    durationWeeks : number,   // most important  // based on this .. we need to calculate the end date .. 
    endDate : Date
  };

  startTime: Date;
  endTime: Date;
  description: string;
  status:  TSpecialistWorkoutClassSchedule.available |
        TSpecialistWorkoutClassSchedule.booked |
        TSpecialistWorkoutClassSchedule.cancelled
        | TSpecialistWorkoutClassSchedule.expired;
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