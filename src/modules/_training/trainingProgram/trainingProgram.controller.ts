import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { TrainingProgram } from './TrainingProgram.model';
import { ITrainingProgram } from './TrainingProgram.interface';
import { TrainingProgramService } from './TrainingProgram.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class TrainingProgramController extends GenericController<
  typeof TrainingProgram,
  ITrainingProgram
> {
  TrainingProgramService = new TrainingProgramService();

  constructor() {
    super(new TrainingProgramService(), 'TrainingProgram');
  }

  // add more methods here if needed or override the existing ones 
}
