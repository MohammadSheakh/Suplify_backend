import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { informationVideo } from './informationVideo.model';
import { IinformationVideo } from './informationVideo.interface';
import { informationVideoService } from './informationVideo.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class informationVideoController extends GenericController<
  typeof informationVideo,
  IinformationVideo
> {
  informationVideoService = new informationVideoService();

  constructor() {
    super(new informationVideoService(), 'informationVideo');
  }

  // add more methods here if needed or override the existing ones 
}
