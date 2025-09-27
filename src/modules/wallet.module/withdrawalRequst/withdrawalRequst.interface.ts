//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TWithdrawalRequst } from './withdrawalRequst.constant';


export interface IWithdrawalRequst {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  walletId: Types.ObjectId; //🔗
  userId: Types.ObjectId;   //🔗

  bankAccountNumber: string;
  bankRoutingNumber: string;
  bankAccountHolder: string;
  bankAccountType: string;
  bankBranch: string;
  bankName: string;

  status: TWithdrawalRequst; //🧩 

  requestedAt: Date;
  processedAt?: Date | null;
  isDeleted? : boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWithdrawalRequstModel extends Model<IWithdrawalRequst> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IWithdrawalRequst>>;
}