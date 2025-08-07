import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { HealthAndPerformance } from './HealthAndPerformance.model';
import { IHealthAndPerformance } from './HealthAndPerformance.interface';
import { HealthAndPerformanceService } from './HealthAndPerformance.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class HealthAndPerformanceController extends GenericController<
  typeof HealthAndPerformance,
  IHealthAndPerformance
> {
  HealthAndPerformanceService = new HealthAndPerformanceService();

  constructor() {
    super(new HealthAndPerformanceService(), 'HealthAndPerformance');
  }

  // add more methods here if needed or override the existing ones 
}
