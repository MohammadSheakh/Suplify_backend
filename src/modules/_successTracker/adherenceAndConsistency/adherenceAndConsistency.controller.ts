import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { AdherenceAndConsistency } from './AdherenceAndConsistency.model';
import { IAdherenceAndConsistency } from './AdherenceAndConsistency.interface';
import { AdherenceAndConsistencyService } from './AdherenceAndConsistency.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class AdherenceAndConsistencyController extends GenericController<
  typeof AdherenceAndConsistency,
  IAdherenceAndConsistency
> {
  AdherenceAndConsistencyService = new AdherenceAndConsistencyService();

  constructor() {
    super(new AdherenceAndConsistencyService(), 'AdherenceAndConsistency');
  }

  // add more methods here if needed or override the existing ones 
}
