import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';

import { LabTestBooking } from './labTestBooking.model';
import { LabTestBookingService } from './labTestBooking.service';
import { ILabTestBooking } from './LabTestBooking.interface';

// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class LabTestBookingController extends GenericController<
  typeof LabTestBooking,
  ILabTestBooking
> {
  LabTestBookingService = new LabTestBookingService();

  constructor() {
    super(new LabTestBookingService(), 'LabTestBooking');
  }

  // add more methods here if needed or override the existing ones 
}
