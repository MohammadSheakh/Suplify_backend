import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TrainingProgram } from './trainingProgram.model';
import { ITrainingProgram } from './trainingProgram.interface';
import { GenericController } from '../../_generic-module/generic.controller';
import { TrainingProgramService } from './trainingProgram.service';

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
