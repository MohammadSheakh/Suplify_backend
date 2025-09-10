//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { DoctorPatient } from './doctorPatient.model';
import { IDoctorPatient } from './doctorPatient.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class DoctorPatientService extends GenericService<
  typeof DoctorPatient,
  IDoctorPatient
> {
  constructor() {
    super(DoctorPatient);
  }
}
