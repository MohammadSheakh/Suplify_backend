import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface IHealthAndPerformance {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  currentWeight: Number;
  bodyFatPercentage : String;
  waistMeasurement : Number;
  energyLevel : Number;
  sleepQuality : Number;
  workoutRecoveryRating : Number;
  
  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHealthAndPerformanceModel extends Model<IHealthAndPerformance> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IHealthAndPerformance>>;
}