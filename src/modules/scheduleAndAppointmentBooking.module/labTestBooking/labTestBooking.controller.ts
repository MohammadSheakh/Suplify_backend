//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { LabTestBooking } from './labTestBooking.model';
import { LabTestBookingService } from './labTestBooking.service';
import { IBookLabTest, ILabTestBooking } from './labTestBooking.interface';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';

// let conversationParticipantsService = new ConversationParticipentsService();

let labTestBookingService = new LabTestBookingService();

export class LabTestBookingController extends GenericController<
  typeof LabTestBooking,
  ILabTestBooking
> {
  LabTestBookingService = new LabTestBookingService();

  constructor() {
    super(new LabTestBookingService(), 'LabTestBooking');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const userTimeZone = req.header('X-Time-Zone') || 'Asia/Dhaka'; //TODO: Timezone must from env file

    const data = req.body as Partial<IBookLabTest>;
    const result = await labTestBookingService.createV2(data, req.user, userTimeZone);

    sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: `${this.modelName} created successfully`,
    success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
