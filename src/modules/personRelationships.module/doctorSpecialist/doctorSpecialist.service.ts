import { StatusCodes } from 'http-status-codes';
import { doctorSpecialist } from './doctorSpecialist.model';
import { IdoctorSpecialist } from './doctorSpecialist.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class doctorSpecialistService extends GenericService<
  typeof doctorSpecialist,
  IdoctorSpecialist
> {
  constructor() {
    super(doctorSpecialist);
  }
}
