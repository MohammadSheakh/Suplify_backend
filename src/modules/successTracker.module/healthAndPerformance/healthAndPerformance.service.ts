import { StatusCodes } from 'http-status-codes';
import { HealthAndPerformance } from './healthAndPerformance.model';
import { IHealthAndPerformance } from './healthAndPerformance.interface';
import { GenericService } from '../../__Generic/generic.services';


export class HealthAndPerformanceService extends GenericService<
  typeof HealthAndPerformance,
  IHealthAndPerformance
> {
  constructor() {
    super(HealthAndPerformance);
  }
}
