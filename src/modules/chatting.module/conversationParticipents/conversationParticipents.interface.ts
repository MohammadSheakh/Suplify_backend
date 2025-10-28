//@ts-ignore
import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { TParticipants } from '../conversation/conversation.constant';

export interface IConversationParticipents {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  userId : Types.ObjectId; //🔗
  userName : string;  // its for search conversation by name .. for better search performance ....  
  conversationId: Types.ObjectId; //🔗
  joinedAt : Date;
  role : TParticipants; //🧩 // can be doctor | specialist | patient | admin
  lastMessageReadAt? : Date;
  unreadCount? : number;

  isDeleted? : boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IConversationParticipentsModel extends Model<IConversationParticipents> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IConversationParticipents>>;
}