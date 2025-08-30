import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface ILabTestBooking {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId: Types.ObjectId;
  message : String;

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBookLabTest{
  labTestId: Types.ObjectId;
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