import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { DoctorAppointmentSchedule } from './doctorAppointmentSchedule.model';
import { IDoctorAppointmentSchedule } from './doctorAppointmentSchedule.interface';
import { DoctorAppointmentScheduleService } from './doctorAppointmentSchedule.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import { TRole } from '../../../middlewares/roles';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class DoctorAppointmentScheduleController extends GenericController<
  typeof DoctorAppointmentSchedule,
  IDoctorAppointmentSchedule
> {
  doctorAppointmentScheduleService = new DoctorAppointmentScheduleService();

  constructor() {
    super(new DoctorAppointmentScheduleService(), 'DoctorAppointmentSchedule');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    console.log("ℹ️hit generic controller");

    const data: IDoctorAppointmentSchedule = req.body;

    data.createdBy = (req.user as IUser)?.userId;

    const result = await this.doctorAppointmentScheduleService.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  //TODO : need to add caching .. 
  /****
   * 
   * Doctor  | Schedule | get all schedule .. (query -> scheduleStatus[available])
   * ******* */
  getAllWithPagination = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    /***
     * 
     * if logged in user role is doctor .. then return for only his schedules... 
     * ***/
    if(req.user && (req.user as IUser)?.role === TRole.doctor){
      filters.createdBy = (req.user as IUser)?.userId; 
    }
    console.log("user from token 🧪", req.user.userId);
    console.log("filters 🧪", filters);

    const populateOptions: (string | {path: string, select: string}[]) = [
      // {
      //   path: 'personId',
      //   select: 'name ' 
      // },
    ];

    // const select = ''; 

    const result = await this.service.getAllWithPagination(filters, options, populateOptions/*, select*/);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });


  // add more methods here if needed or override the existing ones 
}
