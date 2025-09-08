import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TPaymentStatus, TScheduleBookingStatus } from './specialistPatientScheduleBooking.constant';
import { PaymentMethod } from '../../order.module/order/order.constant';


export interface ISpecialistPatientScheduleBooking {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  // Required references
  patientId: Types.ObjectId; // ref: 'User'
  workoutClassScheduleId: Types.ObjectId; // ref: 'SpecialistWorkoutClassSchedule'
  specialistId: Types.ObjectId; // ref: 'User' - provides significant performance benefits
  

  // Status and deletion
  isDeleted?: boolean; // default: false
  status: TScheduleBookingStatus; // required, no default initially
  
  // Payment related fields
  paymentTransactionId?: Types.ObjectId | null; // ref: 'PaymentTransaction', default: null
  paymentMethod?: PaymentMethod;
  price: number; // required
  paymentStatus: TPaymentStatus; // required, initially should be unpaid
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISpecialistPatientScheduleBookingModel extends Model<ISpecialistPatientScheduleBooking> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ISpecialistPatientScheduleBooking>>;
}