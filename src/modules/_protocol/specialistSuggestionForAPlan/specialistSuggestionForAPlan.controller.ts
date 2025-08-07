import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { SpecialistSuggestionForAPlan } from './SpecialistSuggestionForAPlan.model';
import { ISpecialistSuggestionForAPlan } from './SpecialistSuggestionForAPlan.interface';
import { SpecialistSuggestionForAPlanService } from './SpecialistSuggestionForAPlan.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class SpecialistSuggestionForAPlanController extends GenericController<
  typeof SpecialistSuggestionForAPlan,
  ISpecialistSuggestionForAPlan
> {
  SpecialistSuggestionForAPlanService = new SpecialistSuggestionForAPlanService();

  constructor() {
    super(new SpecialistSuggestionForAPlanService(), 'SpecialistSuggestionForAPlan');
  }

  // add more methods here if needed or override the existing ones 
}
