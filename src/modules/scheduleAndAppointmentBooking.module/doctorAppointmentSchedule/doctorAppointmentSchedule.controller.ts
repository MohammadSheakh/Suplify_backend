import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { DoctorAppointmentSchedule } from './doctorAppointmentSchedule.model';
import { IDoctorAppointmentSchedule } from './doctorAppointmentSchedule.interface';
import { DoctorAppointmentScheduleService } from './doctorAppointmentSchedule.service';


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
