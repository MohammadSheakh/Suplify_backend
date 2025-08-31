import { Document, Model, Types } from 'mongoose';
import { Role } from '../../middlewares/roles';
import { IMaritalStatus, TGender, TStatusType, TTSubscription, TUserStatus } from './user.constant';
import { PaginateOptions, PaginateResult } from '../../types/paginate';

export type TProfileImage = {
  imageUrl: string;
  // file: Record<string, any>;
};

export type TPhotoGallery = {
  imageUrl: string;
  file: Record<string, any>;
};

export type TUser = {
  _userId: undefined | Types.ObjectId;
  _id:  undefined; // Types.ObjectId |
  // fullName: string;
  name: string;
  email: string;
  password: string;
  status: TStatusType.active | TStatusType.inactive;
  subscriptionType :  TTSubscription.standard |
  TTSubscription.standardPlus | TTSubscription.vise 
  profileImage?: TProfileImage;
  fcmToken : string;
  stripe_customer_id: string;
  stripeConnectedAccount: string; // from kappes backend 
  role: Role;

  isEmailVerified: boolean;
  isVip  : Boolean,
  isStandard  : Boolean,
  isPremium :  Boolean

  phoneNumber : string;
  isDeleted: boolean;
  lastPasswordChange: Date;
  isResetPassword: boolean;
  failedLoginAttempts: number;
  lockUntil: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
};

export interface UserModal extends Model<TUser> {
  paginate: (
    filter: object,
    options: PaginateOptions,
  ) => Promise<PaginateResult<TUser>>;
  isExistUserById(id: string): Promise<Partial<TUser> | null>;
  isExistUserByEmail(email: string): Promise<Partial<TUser> | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
}
