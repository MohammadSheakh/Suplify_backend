import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { AnswerChoice } from './answerChoice.model';
import { IAnswerChoice } from './AnswerChoice.interface';
import { AnswerChoiceService } from './answerChoice.service';

export class AnswerChoiceController extends GenericController<
  typeof AnswerChoice,
  IAnswerChoice
> {
  AnswerChoiceService = new AnswerChoiceService();

  constructor() {
    super(new AnswerChoiceService(), 'AnswerChoice');
  }

  // add more methods here if needed or override the existing ones 
}
