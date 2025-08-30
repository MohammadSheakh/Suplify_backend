import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { SpecialistPatientScheduleBooking } from './specialistPatientScheduleBooking.model';
import { ISpecialistPatientScheduleBooking } from './specialistPatientScheduleBooking.interface';
import { SpecialistPatientScheduleBookingService } from './specialistPatientScheduleBooking.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class SpecialistPatientScheduleBookingController extends GenericController<
  typeof SpecialistPatientScheduleBooking,
  ISpecialistPatientScheduleBooking
> {
  SpecialistPatientScheduleBookingService = new SpecialistPatientScheduleBookingService();

  constructor() {
    super(new SpecialistPatientScheduleBookingService(), 'SpecialistPatientScheduleBooking');
  }

  create = catchAsync(async (req: Request, res: Response) => {

    const data = req.body as Partial<IBookLabTest>;
    const result = await labTestBookingService.createV2(data, req.user);

    sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: `${this.modelName} created successfully`,
    success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
