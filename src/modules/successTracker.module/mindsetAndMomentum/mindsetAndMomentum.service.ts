import { StatusCodes } from 'http-status-codes';
import { MindsetAndMomentum } from './MindsetAndMomentum.model';
import { IMindsetAndMomentum } from './MindsetAndMomentum.interface';
import { GenericService } from '../_generic-module/generic.services';


export class MindsetAndMomentumService extends GenericService<
  typeof MindsetAndMomentum,
  IMindsetAndMomentum
> {
  constructor() {
    super(MindsetAndMomentum);
  }
}
