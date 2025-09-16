//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { PlanByDoctor } from './planByDoctor.model';
import { IPlanByDoctor } from './planByDoctor.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class PlanByDoctorService extends GenericService<
  typeof PlanByDoctor,
  IPlanByDoctor
> {
  constructor() {
    super(PlanByDoctor);
  }
}
