import { StatusCodes } from 'http-status-codes';
import { TrainingProgram } from './TrainingProgram.model';
import { ITrainingProgram } from './TrainingProgram.interface';
import { GenericService } from '../__Generic/generic.services';


export class TrainingProgramService extends GenericService<
  typeof TrainingProgram,
  ITrainingProgram
> {
  constructor() {
    super(TrainingProgram);
  }
}
