import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { AssessmentAnswer } from './assessmentAnswer.model';
import { IAssessmentAnswer } from './AssessmentAnswer.interface';
import { AssessmentAnswerService } from './assessmentAnswer.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

export class AssessmentAnswerController extends GenericController<
  typeof AssessmentAnswer,
  IAssessmentAnswer
> {
  assessmentAnswerService = new AssessmentAnswerService();

  constructor() {
    super(new AssessmentAnswerService(), 'AssessmentAnswer');
  }

  submitAnswers = catchAsync(async (req: Request, res: Response) => {
    const { answers }: ISubmitAnswers = req.body;
    const userId = req.user._id; // from auth middleware

    const result = await this.assessmentAnswerService.submitAnswers(
      // assessmentId, 
      userId, 
      answers
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Answers submitted successfully',
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
