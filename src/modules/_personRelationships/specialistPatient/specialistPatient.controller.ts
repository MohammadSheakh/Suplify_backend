import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { specialistPatient } from './specialistPatient.model';
import { IspecialistPatient } from './specialistPatient.interface';
import { specialistPatientService } from './specialistPatient.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class specialistPatientController extends GenericController<
  typeof specialistPatient,
  IspecialistPatient
> {
  specialistPatientService = new specialistPatientService();

  constructor() {
    super(new specialistPatientService(), 'specialistPatient');
  }

  // add more methods here if needed or override the existing ones 
}
