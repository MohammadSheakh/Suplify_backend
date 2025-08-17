import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { SuccessTracker } from './successTracker.model';
import { ISuccessTracker } from './successTracker.interface';
import { SuccessTrackerService } from './successTracker.service';


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
