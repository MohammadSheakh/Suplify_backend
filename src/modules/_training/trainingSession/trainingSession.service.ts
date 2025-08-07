import { StatusCodes } from 'http-status-codes';
import { TrainingSession } from './trainingSession.model';
import { ITrainingSession } from './trainingSession.interface';
import { GenericService } from '../../__Generic/generic.services';


export class TrainingSessionService extends GenericService<
  typeof TrainingSession,
  ITrainingSession
> {
  constructor() {
    super(TrainingSession);
  }
}
