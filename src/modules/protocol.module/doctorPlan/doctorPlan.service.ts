import { StatusCodes } from 'http-status-codes';
import { DoctorPlan } from './doctorPlan.model';
import { IDoctorPlan } from './doctorPlan.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class DoctorPlanService extends GenericService<
  typeof DoctorPlan,
  IDoctorPlan
> {
  constructor() {
    super(DoctorPlan);
  }
}
