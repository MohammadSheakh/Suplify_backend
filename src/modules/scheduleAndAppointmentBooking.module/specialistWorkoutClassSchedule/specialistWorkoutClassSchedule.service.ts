import { StatusCodes } from 'http-status-codes';
import { SpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.model';
import { ISpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.interface';
import { GenericService } from '../../_generic-module/generic.services';

export class SpecialistWorkoutClassScheduleService extends GenericService<
  typeof SpecialistWorkoutClassSchedule,
  ISpecialistWorkoutClassSchedule
> {
  constructor() {
    super(SpecialistWorkoutClassSchedule);
  }
}
