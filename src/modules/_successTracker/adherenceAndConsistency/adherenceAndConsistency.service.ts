import { StatusCodes } from 'http-status-codes';
import { AdherenceAndConsistency } from './AdherenceAndConsistency.model';
import { IAdherenceAndConsistency } from './AdherenceAndConsistency.interface';
import { GenericService } from '../__Generic/generic.services';


export class AdherenceAndConsistencyService extends GenericService<
  typeof AdherenceAndConsistency,
  IAdherenceAndConsistency
> {
  constructor() {
    super(AdherenceAndConsistency);
  }
}
