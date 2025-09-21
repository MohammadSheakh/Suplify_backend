import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { PatientTrainingSession } from './patientTrainingSession.model';
import { IPatientTrainingSession } from './PatientTrainingSession.interface';
import { PatientTrainingSessionService } from './patientTrainingSession.service';


export class PatientTrainingSessionController extends GenericController<
  typeof PatientTrainingSession,
  IPatientTrainingSession
> {
  PatientTrainingSessionService = new PatientTrainingSessionService();

  constructor() {
    super(new PatientTrainingSessionService(), 'PatientTrainingSession');
  }

  // add more methods here if needed or override the existing ones 
}
