import { StatusCodes } from 'http-status-codes';
import { AdherenceAndConsistency } from './adherenceAndConsistency.model';
import { IAdherenceAndConsistency } from './adherenceAndConsistency.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class AdherenceAndConsistencyService extends GenericService<
  typeof AdherenceAndConsistency,
  IAdherenceAndConsistency
> {
  constructor() {
    super(AdherenceAndConsistency);
  }
}
