import { StatusCodes } from 'http-status-codes';
import { SatisfactionAndFeedback } from './satisfactionAndFeedback.model';
import { ISatisfactionAndFeedback } from './satisfactionAndFeedback.interface';
import { GenericService } from '../../__Generic/generic.services';


export class SatisfactionAndFeedbackService extends GenericService<
  typeof SatisfactionAndFeedback,
  ISatisfactionAndFeedback
> {
  constructor() {
    super(SatisfactionAndFeedback);
  }
}
