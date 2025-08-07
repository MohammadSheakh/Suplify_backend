import { StatusCodes } from 'http-status-codes';
import { PatientTrainingSession } from './PatientTrainingSession.model';
import { IPatientTrainingSession } from './PatientTrainingSession.interface';
import { GenericService } from '../__Generic/generic.services';


export class PatientTrainingSessionService extends GenericService<
  typeof PatientTrainingSession,
  IPatientTrainingSession
> {
  constructor() {
    super(PatientTrainingSession);
  }
}
