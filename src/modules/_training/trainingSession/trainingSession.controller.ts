import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { TrainingSession } from './TrainingSession.model';
import { ITrainingSession } from './TrainingSession.interface';
import { TrainingSessionService } from './TrainingSession.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class TrainingSessionController extends GenericController<
  typeof TrainingSession,
  ITrainingSession
> {
  TrainingSessionService = new TrainingSessionService();

  constructor() {
    super(new TrainingSessionService(), 'TrainingSession');
  }

  // add more methods here if needed or override the existing ones 
}
