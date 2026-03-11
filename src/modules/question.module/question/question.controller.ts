import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Question } from './question.model';
import { ICreateQuestion, IQuestion } from './Question.interface';
import { QuestionService } from './question.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { TQuestionAnswer } from './question.constant';
import ApiError from '../../../errors/ApiError';
import { AnswerChoice } from '../answerChoice/answerChoice.model';
import { logger } from '../../../shared/logger';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';

export class QuestionController extends GenericController<
  typeof Question,
  IQuestion
> {
  questionService = new QuestionService();

  constructor() {
    super(new QuestionService(), 'Question');
  }

  // 💎✨🔍 -> V2 Found
  create = catchAsync(async (req: Request, res: Response) => {
  
    const data: ICreateQuestion = req.body;

    const result = await this.service.create(data);

    if(data.answerType != TQuestionAnswer.text && data.answerType != TQuestionAnswer.number){
      // so, we have to create answers

      if(data.answers?.length == 0){
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Please Provide answer choices for this question`
        );
      }

      

      for(const answer of data.answers){
        
        const res = await AnswerChoice.create({
          answerTitle : answer.answerTitle,
          questionId : result._id,
        })

      }

    }

  
    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  createV2 = catchAsync(async (req: Request, res: Response) => {
    const data: ICreateQuestion = req.body;
    
    const result = await this.questionService.createQuestionWithAnswers(data);
    
    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  getQuestionsWithAnswersByPhase = catchAsync( async (req: Request, res: Response) => {
    console.log("phaseId -> ", req.params);
    logger.info(" info -> phaseId -> ", req.params)
    logger.warn("--warn-")
    logger.error("--error--")
    
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const result = await this.questionService.getQuestionsWithAnswers(
      options
    );

    // PERF: Send response
    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `Questions with answers retrieved successfully`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
