import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TAssessmentAnswer } from './assessmentAnswer.constant';


export interface IAssessmentAnswer {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  
  assessmentId: Types.ObjectId;
  userId: Types.ObjectId;
  questionId: Types.ObjectId;
  answerValue: any; // MIXED — as per spec (string/number/array/etc. depending on type)
  answerType: TAssessmentAnswer;

  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAssessmentAnswerModel extends Model<IAssessmentAnswer> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IAssessmentAnswer>>;
}