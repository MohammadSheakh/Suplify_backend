import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { SuccessTracker } from './SuccessTracker.model';
import { ISuccessTracker } from './SuccessTracker.interface';
import { SuccessTrackerService } from './SuccessTracker.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class SuccessTrackerController extends GenericController<
  typeof SuccessTracker,
  ISuccessTracker
> {
  SuccessTrackerService = new SuccessTrackerService();

  constructor() {
    super(new SuccessTrackerService(), 'SuccessTracker');
  }

  // add more methods here if needed or override the existing ones 
}
