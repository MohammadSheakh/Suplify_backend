import { StatusCodes } from 'http-status-codes';
// import { TrainingProgram } from './TrainingProgram.model';
import { ITrainingProgram } from './trainingProgram.interface';
import { TrainingProgram } from './trainingProgram.model';
import { GenericService } from '../../__Generic/generic.services';

export class TrainingProgramService extends GenericService<
  typeof TrainingProgram,
  ITrainingProgram
> {
  constructor() {
    super(TrainingProgram);
  }
}
