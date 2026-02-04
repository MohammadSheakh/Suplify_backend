import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TQuestionAnswer } from './question.constant';


export interface IQuestion {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  
  questionText: string;
  answerType: TQuestionAnswer;
  isRequired : Boolean;

  isDeleted? : boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateQuestion {
  questionText: string;
  answerType: TQuestionAnswer;
  isRequired : Boolean;
  answers?:{
    answerTitle : string
  }[],
}

export interface IQuestionModel extends Model<IQuestion> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IQuestion>>;
}