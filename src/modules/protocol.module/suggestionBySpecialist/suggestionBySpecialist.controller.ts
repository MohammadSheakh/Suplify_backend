import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { SuggestionBySpecialist } from './suggestionBySpecialist.model';
import { ISuggestionBySpecialist } from './suggestionBySpecialist.interface';
import { SuggestionBySpecialistService } from './suggestionBySpecialist.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class SuggestionBySpecialistController extends GenericController<
  typeof SuggestionBySpecialist,
  ISuggestionBySpecialist
> {
  suggestionBySpecialistService = new SuggestionBySpecialistService();

  constructor() {
    super(new SuggestionBySpecialistService(), 'SuggestionBySpecialist');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    
    const data: Partial<ISuggestionBySpecialist & { planId?: string }> = req.body;

    data.createdBy = (req.user as any).userId; // specialist id
    data.planId = req.body.planId; // plan id

    const result = await this.suggestionBySpecialistService.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
