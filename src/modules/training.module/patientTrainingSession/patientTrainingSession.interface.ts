import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TPatientTrainingSessionStatus } from './patientTrainingSession.constant';


export interface IPatientTrainingSession {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  trainingSessionId: Types.ObjectId; //🔗
  patientId : Types.ObjectId; //🔗
  status :  TPatientTrainingSessionStatus.complete |
          TPatientTrainingSessionStatus.incomplete;

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPatientTrainingSessionModel extends Model<IPatientTrainingSession> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IPatientTrainingSession>>;
}