import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { PAYMENT_METHOD } from '../../order.module/order/order.constant';
import { TPaymentStatus } from '../../scheduleAndAppointmentBooking.module/specialistPatientScheduleBooking/specialistPatientScheduleBooking.constant';

export interface ITrainingProgramPurchase {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  trainingProgramId: Types.ObjectId; //🔗
  patientId: Types.ObjectId; //🔗
  paymentTransactionId: Types.ObjectId | null; //🔗
  paymentMethod: PAYMENT_METHOD.online;

  paymentStatus: TPaymentStatus.unpaid |
    TPaymentStatus.paid |
    TPaymentStatus.refunded |
    TPaymentStatus.failed ;

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITrainingProgramPurchaseModel extends Model<ITrainingProgramPurchase> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ITrainingProgramPurchase>>;
}