import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';


export interface ISuccessTracker {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  createdBy: Types.ObjectId;
  mindsetAndMomentumId: Types.ObjectId;
  satisfactionAndFeedbackId: Types.ObjectId;
  adherenceAndConsistencyId: Types.ObjectId;
  healthAndPerformanceId: Types.ObjectId;

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}




export interface ISuccessTrackerModel extends Model<ISuccessTracker> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<ISuccessTracker>>;
}


// ========================
// TYPES/INTERFACES (if using TypeScript)
// ========================

interface OverviewTableItem {
  slNo: number;
  question: string;
  previousWeek: string | number;
  lastWeek: string | number;
  category: 'health' | 'adherence' | 'mindset' | 'satisfaction';
}

interface CategoryScore {
  score: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

interface OverviewResponse {
  weekInfo: {
    currentWeek: {
      weekStartDate: Date;
      weekEndDate: Date;
    } | null;
    previousWeek: {
      weekStartDate: Date;
      weekEndDate: Date;
    } | null;
  };
  categoryScores: {
    healthAndPerformance: CategoryScore;
    adherenceAndConsistency: CategoryScore;
    mindsetAndMomentum: CategoryScore;
    satisfactionAndFeedback: CategoryScore;
  };
  overviewTable: OverviewTableItem[];
  overallScore: CategoryScore;
}