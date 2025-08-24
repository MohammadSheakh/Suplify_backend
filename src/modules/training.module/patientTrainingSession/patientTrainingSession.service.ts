import { StatusCodes } from 'http-status-codes';
import { PatientTrainingSession } from './patientTrainingSession.model';
import { IPatientTrainingSession } from './PatientTrainingSession.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class PatientTrainingSessionService extends GenericService<
  typeof PatientTrainingSession,
  IPatientTrainingSession
> {
  constructor() {
    super(PatientTrainingSession);
  }
}
