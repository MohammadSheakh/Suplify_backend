import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../_generic-module/generic.controller';
import { MindsetAndMomentum } from './MindsetAndMomentum.model';
import { IMindsetAndMomentum } from './MindsetAndMomentum.interface';
import { MindsetAndMomentumService } from './MindsetAndMomentum.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class MindsetAndMomentumController extends GenericController<
  typeof MindsetAndMomentum,
  IMindsetAndMomentum
> {
  MindsetAndMomentumService = new MindsetAndMomentumService();

  constructor() {
    super(new MindsetAndMomentumService(), 'MindsetAndMomentum');
  }

  // add more methods here if needed or override the existing ones 
}
