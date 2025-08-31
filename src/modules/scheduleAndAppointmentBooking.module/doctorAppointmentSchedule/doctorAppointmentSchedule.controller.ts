import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { DoctorAppointmentSchedule } from './doctorAppointmentSchedule.model';
import { IDoctorAppointmentSchedule } from './doctorAppointmentSchedule.interface';
import { DoctorAppointmentScheduleService } from './doctorAppointmentSchedule.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';


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

  // add more methods here if needed or override the existing ones 
}
