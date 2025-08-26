import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface ISatisfactionAndFeedback {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  areYouHappyWithCurrentProgress: Boolean;
  doYouFeelSupported : Boolean;
  oneThingYouNeedHelpWith : String
  oneHabitYouImprovedOrBuiltThisWeek : String
  wouldYouRecommendUs : Boolean

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISatisfactionAndFeedbackModel extends Model<ISatisfactionAndFeedback> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ISatisfactionAndFeedback>>;
}