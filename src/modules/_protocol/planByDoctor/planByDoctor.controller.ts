import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../__Generic/generic.controller';
import { planByDoctor } from './planByDoctor.model';
import { IplanByDoctor } from './planByDoctor.interface';
import { planByDoctorService } from './planByDoctor.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class planByDoctorController extends GenericController<
  typeof planByDoctor,
  IplanByDoctor
> {
  planByDoctorService = new planByDoctorService();

  constructor() {
    super(new planByDoctorService(), 'planByDoctor');
  }

  // add more methods here if needed or override the existing ones 
}
