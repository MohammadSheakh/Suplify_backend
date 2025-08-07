import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../__Generic/generic.controller';
import { SatisfactionAndFeedback } from './satisfactionAndFeedback.model';
import { ISatisfactionAndFeedback } from './satisfactionAndFeedback.interface';
import { SatisfactionAndFeedbackService } from './satisfactionAndFeedback.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class SatisfactionAndFeedbackController extends GenericController<
  typeof SatisfactionAndFeedback,
  ISatisfactionAndFeedback
> {
  SatisfactionAndFeedbackService = new SatisfactionAndFeedbackService();

  constructor() {
    super(new SatisfactionAndFeedbackService(), 'SatisfactionAndFeedback');
  }

  // add more methods here if needed or override the existing ones 
}
