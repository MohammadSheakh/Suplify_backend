import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { doctorPatient } from './doctorPatient.model';
import { IdoctorPatient } from './doctorPatient.interface';
import { doctorPatientService } from './doctorPatient.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class doctorPatientController extends GenericController<
  typeof doctorPatient,
  IdoctorPatient
> {
  doctorPatientService = new doctorPatientService();

  constructor() {
    super(new doctorPatientService(), 'doctorPatient');
  }

  // add more methods here if needed or override the existing ones 
}
