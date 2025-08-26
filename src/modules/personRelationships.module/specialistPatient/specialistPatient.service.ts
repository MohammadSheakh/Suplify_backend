import { StatusCodes } from 'http-status-codes';
import { specialistPatient } from './specialistPatient.model';
import { IspecialistPatient } from './specialistPatient.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class specialistPatientService extends GenericService<
  typeof specialistPatient,
  IspecialistPatient
> {
  constructor() {
    super(specialistPatient);
  }
}
