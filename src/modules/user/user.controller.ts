//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import {  UserService } from './user.service';
import { User } from './user.model';
import { GenericController } from '../_generic-module/generic.controller';
//@ts-ignore
import { Request, Response } from 'express';
import { IUser } from '../token/token.interface';

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

  /***********
   * 
   * Specialist | Get Profile Information as logged in user 
   * 
   * ********** */
  getById = catchAsync(async (req: Request, res: Response) => {
    const id = (req.user as IUser).userId;

    // TODO : ⚠️ need to optimize this populate options ..
    const populateOptions = [
      'profileId',
      {
        path: 'profileId',
        select: '-attachments -__v', // TODO MUST : when create profile .. must initiate address and description
        // populate: {
        //   path: 'profileId',
        // }
      }
    ];
    const select = 'name profileImage';

    const result = await this.service.getById(id, populateOptions, select);

    // if (!result) {
    //   throw new ApiError(
    //     StatusCodes.NOT_FOUND,
    //     `Object with ID ${id} not found`
    //   );
    // }

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} retrieved successfully`,
    });
  });


}


