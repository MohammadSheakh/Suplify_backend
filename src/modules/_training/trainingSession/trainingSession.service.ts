import { StatusCodes } from 'http-status-codes';
import { TrainingSession } from './TrainingSession.model';
import { ITrainingSession } from './TrainingSession.interface';
import { GenericService } from '../__Generic/generic.services';


export class TrainingSessionService extends GenericService<
  typeof TrainingSession,
  ITrainingSession
> {
  constructor() {
    super(TrainingSession);
  }
}
