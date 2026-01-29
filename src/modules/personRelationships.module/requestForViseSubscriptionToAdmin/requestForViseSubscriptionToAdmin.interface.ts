//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { THireStatus } from './requestForViseSubscriptionToAdmin.constant';

export interface IRequestForViseSubscriptionToAdmin {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |

  patientId: Types.ObjectId;
  status : THireStatus;
  
  isDeleted? : boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRequestForViseSubscriptionToAdminModel extends Model<IRequestForViseSubscriptionToAdmin> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IRequestForViseSubscriptionToAdmin>>;
}