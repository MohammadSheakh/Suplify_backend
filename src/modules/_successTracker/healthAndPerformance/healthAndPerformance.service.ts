import { StatusCodes } from 'http-status-codes';
import { HealthAndPerformance } from './HealthAndPerformance.model';
import { IHealthAndPerformance } from './HealthAndPerformance.interface';
import { GenericService } from '../__Generic/generic.services';


export class HealthAndPerformanceService extends GenericService<
  typeof HealthAndPerformance,
  IHealthAndPerformance
> {
  constructor() {
    super(HealthAndPerformance);
  }
}
