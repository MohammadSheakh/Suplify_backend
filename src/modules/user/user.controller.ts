//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import pick from '../../shared/pick';
import sendResponse from '../../shared/sendResponse';
import ApiError from '../../errors/ApiError';
import {  UserService } from './user.service';
import { User } from './user.model';
import { GenericController } from '../_generic-module/generic.controller';
import { IUser } from './user.interface';

const userService = new UserService();

// TODO : IUser should be import from user.interface
export class UserController extends GenericController<
  typeof User,
  IUser
> {
  userService = new UserService();

  constructor() {
    super(new UserService(), 'User');
  }

  createAdminOrSuperAdmin = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await this.userService.createAdminOrSuperAdmin(payload);
    sendResponse(res, {
      code: StatusCodes.CREATED,
      data: result,
      message: `${
        payload.role === 'admin' ? 'Admin' : 'Super Admin'
      } created successfully`,
    });
  });

}


