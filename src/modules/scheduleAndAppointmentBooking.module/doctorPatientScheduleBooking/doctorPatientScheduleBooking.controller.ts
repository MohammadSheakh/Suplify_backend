import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { DoctorPatientScheduleBooking } from './doctorPatientScheduleBooking.model';
import { IDoctorPatientScheduleBooking } from './doctorPatientScheduleBooking.interface';
import { DoctorPatientScheduleBookingService } from './doctorPatientScheduleBooking.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class DoctorPatientScheduleBookingController extends GenericController<
  typeof DoctorPatientScheduleBooking,
  IDoctorPatientScheduleBooking
> {
  doctorPatientScheduleBookingService = new DoctorPatientScheduleBookingService();

  constructor() {
    super(new DoctorPatientScheduleBookingService(), 'DoctorPatientScheduleBooking');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    /********
     * here we also check if relation ship between doctor and patient exist or not
     *  if not then we create the relationship 
     * *** */
    const result = await this.doctorPatientScheduleBookingService.createV2(req.params.doctorScheduleId, req.user as IUser);

    sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: `${this.modelName} created successfully`,
    success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
