import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../_generic-module/generic.controller';
import { DoctorPlan } from './DoctorPlan.model';
import { IDoctorPlan } from './DoctorPlan.interface';
import { DoctorPlanService } from './DoctorPlan.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class DoctorPlanController extends GenericController<
  typeof DoctorPlan,
  IDoctorPlan
> {
  DoctorPlanService = new DoctorPlanService();

  constructor() {
    super(new DoctorPlanService(), 'DoctorPlan');
  }

  // add more methods here if needed or override the existing ones 
}
