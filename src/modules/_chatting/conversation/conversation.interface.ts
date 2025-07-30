import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { ConversationType } from './conversation.constant';
import { RoleType } from '../message/message.constant';

export interface IConversation {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |
  creatorId : Types.ObjectId;
  type: ConversationType.direct | ConversationType.group;
  siteId ?: Types.ObjectId; // Reference to the site
  canConversate? : Boolean; // Optional field to control if the user can converse in this chat
  groupName?: string; // Optional group name
  groupProfilePicture?: string; // Optional group profile picture
  groupBio?: string; // Optional group bio
  groupAdmins?: Types.ObjectId[]; // Array of user IDs who are admins in the group
  unreadCountes?: Record<string, number>; // Dynamic structure for unread counts
  blockedUsers?: Types.ObjectId[]; // Users who are blocked
  deletedFor?: Types.ObjectId[]; // Users who have deleted the chat
  lastMessage ?: Types.ObjectId; // Reference to the last message in the conversation
  ///////////////////////////////////////
  isDeleted? : boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // isGroup : boolean;  
}

export interface IConversationModel extends Model<IConversation> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IConversation>>;
}