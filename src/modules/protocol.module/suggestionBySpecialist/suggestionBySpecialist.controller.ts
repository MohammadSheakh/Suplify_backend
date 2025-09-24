import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { SuggestionBySpecialist } from './suggestionBySpecialist.model';
import { ISuggestionBySpecialist } from './suggestionBySpecialist.interface';
import { SuggestionBySpecialistService } from './suggestionBySpecialist.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';


export class SuggestionBySpecialistController extends GenericController<
  typeof SuggestionBySpecialist,
  ISuggestionBySpecialist
> {
  suggestionBySpecialistService = new SuggestionBySpecialistService();

  constructor() {
    super(new SuggestionBySpecialistService(), 'SuggestionBySpecialist');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    
    const data: (Partial<ISuggestionBySpecialist> | undefined)[] = req.body;
    //  & { planId?: string }

    const result = await this.suggestionBySpecialistService.createV2(
      data, 
      (req.user as any).userId, // specialistId
      req.query.planByDoctorId // planByDoctorId
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
