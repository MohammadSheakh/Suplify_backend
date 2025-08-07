import { StatusCodes } from 'http-status-codes';
import { SatisfactionAndFeedback } from './SatisfactionAndFeedback.model';
import { ISatisfactionAndFeedback } from './SatisfactionAndFeedback.interface';
import { GenericService } from '../__Generic/generic.services';


export class SatisfactionAndFeedbackService extends GenericService<
  typeof SatisfactionAndFeedback,
  ISatisfactionAndFeedback
> {
  constructor() {
    super(SatisfactionAndFeedback);
  }
}
