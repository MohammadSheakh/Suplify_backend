import { StatusCodes } from 'http-status-codes';
import { doctorPatient } from './doctorPatient.model';
import { IdoctorPatient } from './doctorPatient.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class doctorPatientService extends GenericService<
  typeof doctorPatient,
  IdoctorPatient
> {
  constructor() {
    super(doctorPatient);
  }
}
