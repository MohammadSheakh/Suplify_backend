import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { SpecialistPatientScheduleBooking } from './specialistPatientScheduleBooking.model';
import { ISpecialistPatientScheduleBooking } from './specialistPatientScheduleBooking.interface';
import { SpecialistPatientScheduleBookingService } from './specialistPatientScheduleBooking.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';


export class SpecialistPatientScheduleBookingController extends GenericController<
  typeof SpecialistPatientScheduleBooking,
  ISpecialistPatientScheduleBooking
> {
  SpecialistPatientScheduleBookingService = new SpecialistPatientScheduleBookingService();

  constructor() {
    super(new SpecialistPatientScheduleBookingService(), 'SpecialistPatientScheduleBooking');
  }


  create = catchAsync(async (req: Request, res: Response) => {

    const result = await this.SpecialistPatientScheduleBookingService.createV2(req.params.workoutClassId, req.user as IUser);

    sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: `${this.modelName} created successfully`,
    success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
