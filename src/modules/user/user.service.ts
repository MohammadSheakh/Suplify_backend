import { StatusCodes } from 'http-status-codes';
import ApiError from '../../errors/ApiError';
import { PaginateOptions, PaginateResult } from '../../types/paginate';
import { IUser, TUser } from './user.interface';
import { User } from './user.model';
import { sendAdminOrSuperAdminCreationEmail } from '../../helpers/emailService';

import { GenericService } from '../_generic-module/generic.services';

interface IAdminOrSuperAdminPayload {
  email: string;
  password: string;
  role: string;
  message?: string;
}

export class UserService extends GenericService<typeof User, IUser> {
  constructor() {
    super(User);
  }

  createAdminOrSuperAdmin = async (payload: IAdminOrSuperAdminPayload): Promise<TUser> => {

    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'This email already exists');
    }
    const result = new User({
      first_name: 'New',
      last_name: ` ${payload.role === 'admin' ? 'Admin' : 'Super Admin'}`,
      email: payload.email,
      password: payload.password,
      role: payload.role,
    });

    await result.save();
    //send email for the new admin or super admin via email service
    // todo
    sendAdminOrSuperAdminCreationEmail(
      payload.email,
      payload.role,
      payload.password,
      payload.message
    );

    return result;
  };

}

/*********
const getAllUsers = async (
  filters: Record<string, any>,
  options: PaginateOptions
): Promise<PaginateResult<TUser>> => {
  const query: Record<string, any> = {};
  if (filters.userName) {
    query['first_name'] = { $regex: filters.userName, $options: 'i' };
  }
  if (filters.email) {
    query['email'] = { $regex: filters.email, $options: 'i' };
  }
  if (filters.role) {
    query['role'] = filters.role;
  }
  return await User.paginate(query, options);
};

********** */
