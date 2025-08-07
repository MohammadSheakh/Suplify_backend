import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { DoctorAppointmentSchedule } from './DoctorAppointmentSchedule.model';
import { IDoctorAppointmentSchedule } from './DoctorAppointmentSchedule.interface';
import { DoctorAppointmentScheduleService } from './DoctorAppointmentSchedule.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class DoctorAppointmentScheduleController extends GenericController<
  typeof DoctorAppointmentSchedule,
  IDoctorAppointmentSchedule
> {
  DoctorAppointmentScheduleService = new DoctorAppointmentScheduleService();

  constructor() {
    super(new DoctorAppointmentScheduleService(), 'DoctorAppointmentSchedule');
  }

  // add more methods here if needed or override the existing ones 
}
