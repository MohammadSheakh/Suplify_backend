import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { SpecialistPatientScheduleBooking } from './specialistPatientScheduleBooking.model';
import { ISpecialistPatientScheduleBooking } from './specialistPatientScheduleBooking.interface';
import { SpecialistPatientScheduleBookingService } from './specialistPatientScheduleBooking.service';


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
