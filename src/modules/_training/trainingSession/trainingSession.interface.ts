import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TrainingProgramCategory, TrainingProgramType } from '../trainingProgram/trainingProgram.constant';
import { TrainingSessionStatus } from './trainingSession.constant';

export interface ITrainingSession {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  trainingProgramId : Types.ObjectId;
  title: string;
  attachments: Types.ObjectId[]; // Array of ObjectId references to Attachment
  duration : string;
  type :  TrainingProgramType.personalTraining |
          TrainingProgramType.groupTraining
  meetingLinkType: TrainingProgramCategory.meet |
          TrainingProgramCategory.zoom;
  meetingLinkUrl : string;
  status  : TrainingSessionStatus.scheduled |
          TrainingSessionStatus.completed |
          TrainingSessionStatus.active |
          TrainingSessionStatus.postponed |
          TrainingSessionStatus.cancelled; 

  isDeleted : boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITrainingSessionModel extends Model<ITrainingSession> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ITrainingSession>>;
}