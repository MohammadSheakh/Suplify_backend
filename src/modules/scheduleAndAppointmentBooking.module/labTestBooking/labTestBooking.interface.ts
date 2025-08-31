import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TLabTestBookingStatus } from './labTestBooking.constant';
import { PaymentMethod } from '../../order.module/order/order.constant';
import { TPaymentStatus } from '../specialistPatientScheduleBooking/specialistPatientScheduleBooking.constant';


export interface ILabTestBooking {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  patientId: Types.ObjectId;//🔗
  labTestId: Types.ObjectId;//🔗
  appointmentDate : Date; // '2023-10-10'
  startTime : string; // ''
  endTime : string;

  address: string;
  city: string;
  state: string;
  zipCode: string;

  status: TLabTestBookingStatus.pending | TLabTestBookingStatus.confirmed | TLabTestBookingStatus.canceled;

  paymentTransactionId: Types.ObjectId | null;
  paymentMethod: PaymentMethod;
  paymentStatus : TPaymentStatus.failed | TPaymentStatus.unpaid | TPaymentStatus.paid | TPaymentStatus.refunded;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBookLabTest{
  labTestId: Types.ObjectId;
  
  appointmentDate : Date; // '2023-10-10'
  startTime : string ; // ''
  endTime : string;
  
  address: string;
  city: string;
  state : string;
  zipCode : string;
  country : string;
}

export interface ILabTestBookingModel extends Model<ILabTestBooking> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ILabTestBooking>>;
}