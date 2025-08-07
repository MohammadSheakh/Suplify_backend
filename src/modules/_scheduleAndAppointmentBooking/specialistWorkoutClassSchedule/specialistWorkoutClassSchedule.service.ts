import { StatusCodes } from 'http-status-codes';
import { SpecialistWorkoutClassSchedule } from './SpecialistWorkoutClassSchedule.model';
import { ISpecialistWorkoutClassSchedule } from './SpecialistWorkoutClassSchedule.interface';
import { GenericService } from '../__Generic/generic.services';


export class SpecialistWorkoutClassScheduleService extends GenericService<
  typeof SpecialistWorkoutClassSchedule,
  ISpecialistWorkoutClassSchedule
> {
  constructor() {
    super(SpecialistWorkoutClassSchedule);
  }
}
