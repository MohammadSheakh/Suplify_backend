import { StatusCodes } from 'http-status-codes';
import { TrainingProgramPurchase } from './TrainingProgramPurchase.model';
import { ITrainingProgramPurchase } from './TrainingProgramPurchase.interface';
import { GenericService } from '../_generic-module/generic.services';


export class TrainingProgramPurchaseService extends GenericService<
  typeof TrainingProgramPurchase,
  ITrainingProgramPurchase
> {
  constructor() {
    super(TrainingProgramPurchase);
  }
}
