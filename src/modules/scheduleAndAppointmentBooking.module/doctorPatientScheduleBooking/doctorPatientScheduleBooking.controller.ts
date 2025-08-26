import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { DoctorPatientScheduleBooking } from './doctorPatientScheduleBooking.model';
import { IDoctorPatientScheduleBooking } from './doctorPatientScheduleBooking.interface';
import { DoctorPatientScheduleBookingService } from './doctorPatientScheduleBooking.service';


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
