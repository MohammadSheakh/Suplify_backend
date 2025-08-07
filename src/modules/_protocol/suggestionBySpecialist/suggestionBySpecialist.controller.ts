import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { SuggestionBySpecialist } from './SuggestionBySpecialist.model';
import { ISuggestionBySpecialist } from './SuggestionBySpecialist.interface';
import { SuggestionBySpecialistService } from './SuggestionBySpecialist.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class SuggestionBySpecialistController extends GenericController<
  typeof SuggestionBySpecialist,
  ISuggestionBySpecialist
> {
  SuggestionBySpecialistService = new SuggestionBySpecialistService();

  constructor() {
    super(new SuggestionBySpecialistService(), 'SuggestionBySpecialist');
  }

  // add more methods here if needed or override the existing ones 
}
