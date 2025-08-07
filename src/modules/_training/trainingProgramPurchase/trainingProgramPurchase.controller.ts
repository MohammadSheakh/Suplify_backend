import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../__Generic/generic.controller';
import { TrainingProgramPurchase } from './trainingProgramPurchase.model';
import { ITrainingProgramPurchase } from './trainingProgramPurchase.interface';
import { TrainingProgramPurchaseService } from './trainingProgramPurchase.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class TrainingProgramPurchaseController extends GenericController<
  typeof TrainingProgramPurchase,
  ITrainingProgramPurchase
> {
  TrainingProgramPurchaseService = new TrainingProgramPurchaseService();

  constructor() {
    super(new TrainingProgramPurchaseService(), 'TrainingProgramPurchase');
  }

  // add more methods here if needed or override the existing ones 
}
