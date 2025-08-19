import { StatusCodes } from 'http-status-codes';
import { DoctorPlan } from './DoctorPlan.model';
import { IDoctorPlan } from './DoctorPlan.interface';
import { GenericService } from '../_generic-module/generic.services';


export class DoctorPlanService extends GenericService<
  typeof DoctorPlan,
  IDoctorPlan
> {
  constructor() {
    super(DoctorPlan);
  }
}
