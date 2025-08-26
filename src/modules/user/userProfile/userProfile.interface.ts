import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TApprovalStatus } from './userProfile.constant';


export interface IUserProfile {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  attachments: Types.ObjectId[]; 
  approvalStatus : TApprovalStatus.pending |
              TApprovalStatus.approved |
              TApprovalStatus.rejected;

  protocolNames : [String];
  howManyPrograms: Number;
  userId: Types.ObjectId; // for back reference ..
  description: String;

  isDeleted? : Boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserProfileModel extends Model<IUserProfile> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IUserProfile>>;
}