import { Model, Types } from 'mongoose';

import {  TrainingProgramCategory, TrainingProgramType } from './trainingProgram.constant';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IRrainingProgram {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  name : string;
  attachments: Types.ObjectId[]; // Array of ObjectId references to Attachment
  totalTrainingCount : number;
  price : number;
  type : TrainingProgramType.groupTraining | TrainingProgramType.personalTraining;
  meetingLinkType?:  TrainingProgramCategory.meet | TrainingProgramCategory.zoom; // Enum for task status
  isDeleted : boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITRrainingProgramModel extends Model<IRrainingProgram> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IRrainingProgram>>;
}