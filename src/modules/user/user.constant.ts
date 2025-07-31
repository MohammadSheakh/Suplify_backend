export type Role = 'super_admin' | 'admin' | 'user';
// TODO : fix korte hobe .. 
export type TUserStatus = 'active' | 'delete' | 'block';

export const UserStatus: TUserStatus[] = ['active', 'block', 'delete'];
/******** suplify
 * 
 * ****** */
export enum TSubscriptionType{
  standard = 'standard', // $70 per month
  standardPlus = 'standardPlus', // $350 per month
  vise = 'vise', // $750 per month
}
/******** suplify
 * 
 * ****** */
export enum TStatusType {
  active = 'active',
  inactive = 'inactive',
}

export type TGender =
  | 'male'
  | 'female'
  | 'transgender'
  | 'other'

export const Gender: TGender[] = [
  'male',
  'female',
  'transgender',
  'other'
];

export type IMaritalStatus =
  | 'single'
  | 'married'
  | 'divorced'
  | 'widowed'
  | 'engaged'
  | 'separated'
  | 'in a relationship'
  | 'domestic partnership'
  | 'complicated'
  | 'widower'
  | 'prefer not to say'
  | 'other';

export const MaritalStatus: IMaritalStatus[] = [
  'single',
  'married',
  'divorced',
  'widowed',
  'engaged',
  'separated',
  'in a relationship',
  'domestic partnership',
  'complicated',
  'widower',
  'prefer not to say',
  'other',
];
