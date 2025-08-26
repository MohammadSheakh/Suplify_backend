import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { SuggestionBySpecialist } from './suggestionBySpecialist.model';
import { ISuggestionBySpecialist } from './suggestionBySpecialist.interface';
import { SuggestionBySpecialistService } from './suggestionBySpecialist.service';


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
