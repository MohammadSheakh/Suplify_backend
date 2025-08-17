import { StatusCodes } from 'http-status-codes';
// import { TrainingProgram } from './TrainingProgram.model';
import { ITrainingProgram } from './trainingProgram.interface';
import { TrainingProgram } from './trainingProgram.model';
import { GenericService } from '../../_generic-module/generic.services';

export class TrainingProgramService extends GenericService<
  typeof TrainingProgram,
  ITrainingProgram
> {
  constructor() {
    super(TrainingProgram);
  }
}
