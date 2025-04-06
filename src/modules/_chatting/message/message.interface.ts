import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IMessage {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  text : String;
  attachments: Types.ObjectId[];
  senderId :  Types.ObjectId; // 🔗
  conversationId : Types.ObjectId; // 🔗
  senderRole : 'user' | 'admin' | 'trainer'; // TODO : Enum gula fix korte hobe ..
  isDeleted : boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessageModel extends Model<IMessage> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IMessage>>;
}