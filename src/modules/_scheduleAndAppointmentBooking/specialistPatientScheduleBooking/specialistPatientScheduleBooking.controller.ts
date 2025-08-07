import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { SpecialistPatientScheduleBooking } from './SpecialistPatientScheduleBooking.model';
import { ISpecialistPatientScheduleBooking } from './SpecialistPatientScheduleBooking.interface';
import { SpecialistPatientScheduleBookingService } from './SpecialistPatientScheduleBooking.service';


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

  // add more methods here if needed or override the existing ones 
}
