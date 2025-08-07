import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../__Generic/generic.controller';
import { protocol } from './protocol.model';
import { Iprotocol } from './protocol.interface';
import { protocolService } from './protocol.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class protocolController extends GenericController<
  typeof protocol,
  Iprotocol
> {
  protocolService = new protocolService();

  constructor() {
    super(new protocolService(), 'protocol');
  }

  // add more methods here if needed or override the existing ones 
}
