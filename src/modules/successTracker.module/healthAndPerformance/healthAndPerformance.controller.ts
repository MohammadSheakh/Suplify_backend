import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { HealthAndPerformance } from './healthAndPerformance.model';
import { IHealthAndPerformance } from './healthAndPerformance.interface';
import { HealthAndPerformanceService } from './healthAndPerformance.service';


export class HealthAndPerformanceController extends GenericController<
  typeof HealthAndPerformance,
  IHealthAndPerformance
> {
  HealthAndPerformanceService = new HealthAndPerformanceService();

  constructor() {
    super(new HealthAndPerformanceService(), 'HealthAndPerformance');
  }

  // add more methods here if needed or override the existing ones 
}
