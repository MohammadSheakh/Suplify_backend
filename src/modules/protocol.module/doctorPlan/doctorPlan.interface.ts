//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TPlanByDoctor } from '../planByDoctor/planByDoctor.constant';

export interface IDoctorPlan {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  planType: TPlanByDoctor.lifeStyleChanges |
      TPlanByDoctor.mealPlan |
      TPlanByDoctor.suppliment |
      TPlanByDoctor.workOut | TPlanByDoctor.labTest;

  createdBy: Types.ObjectId; //🔗 doctor Id  
  title: string;
  description: string;
  keyPoints: string[];
  totalKeyPoints: number;

  isDeleted?: Boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDoctorPlanModel extends Model<IDoctorPlan> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IDoctorPlan>>;
}