import { StatusCodes } from 'http-status-codes';
import { AnswerChoice } from './answerChoice.model';
import { IAnswerChoice } from './answerChoice.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class AnswerChoiceService extends GenericService<
  typeof AnswerChoice,
  IAnswerChoice
> {
  constructor() {
    super(AnswerChoice);
  }
}
