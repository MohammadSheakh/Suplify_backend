//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { PlanByDoctor } from './planByDoctor.model';
import { IPlanByDoctor } from './planByDoctor.interface';
import { PlanByDoctorService } from './planByDoctor.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class PlanByDoctorController extends GenericController<
  typeof PlanByDoctor,
  IPlanByDoctor
> {
  planByDoctorService = new PlanByDoctorService();

  constructor() {
    super(new PlanByDoctorService(), 'PlanByDoctor');
  }

  // add more methods here if needed or override the existing ones 
}
