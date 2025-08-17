import { StatusCodes } from 'http-status-codes';
import { TrainingProgramPurchase } from './TrainingProgramPurchase.model';
import { ITrainingProgramPurchase } from './TrainingProgramPurchase.interface';
import { GenericService } from '../__Generic/generic.services';


export class TrainingProgramPurchaseService extends GenericService<
  typeof TrainingProgramPurchase,
  ITrainingProgramPurchase
> {
  constructor() {
    super(TrainingProgramPurchase);
  }
}
