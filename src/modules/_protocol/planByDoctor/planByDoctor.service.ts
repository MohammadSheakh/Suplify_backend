import { StatusCodes } from 'http-status-codes';
import { planByDoctor } from './planByDoctor.model';
import { IplanByDoctor } from './planByDoctor.interface';
import { GenericService } from '../__Generic/generic.services';


export class planByDoctorService extends GenericService<
  typeof planByDoctor,
  IplanByDoctor
> {
  constructor() {
    super(planByDoctor);
  }
}
