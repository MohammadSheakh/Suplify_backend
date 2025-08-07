import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { DoctorPatientScheduleBooking } from './DoctorPatientScheduleBooking.model';
import { IDoctorPatientScheduleBooking } from './DoctorPatientScheduleBooking.interface';
import { DoctorPatientScheduleBookingService } from './DoctorPatientScheduleBooking.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class DoctorPatientScheduleBookingController extends GenericController<
  typeof DoctorPatientScheduleBooking,
  IDoctorPatientScheduleBooking
> {
  DoctorPatientScheduleBookingService = new DoctorPatientScheduleBookingService();

  constructor() {
    super(new DoctorPatientScheduleBookingService(), 'DoctorPatientScheduleBooking');
  }

  // add more methods here if needed or override the existing ones 
}
