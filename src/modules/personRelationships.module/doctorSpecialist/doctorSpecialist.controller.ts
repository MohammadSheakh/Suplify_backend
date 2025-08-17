import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { doctorSpecialist } from './doctorSpecialist.model';
import { IdoctorSpecialist } from './doctorSpecialist.interface';
import { doctorSpecialistService } from './doctorSpecialist.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class doctorSpecialistController extends GenericController<
  typeof doctorSpecialist,
  IdoctorSpecialist
> {
  doctorSpecialistService = new doctorSpecialistService();

  constructor() {
    super(new doctorSpecialistService(), 'doctorSpecialist');
  }

  // add more methods here if needed or override the existing ones 
}
