import { StatusCodes } from 'http-status-codes';
import { SuccessTracker } from './SuccessTracker.model';
import { ISuccessTracker } from './SuccessTracker.interface';
import { GenericService } from '../__Generic/generic.services';


export class SuccessTrackerService extends GenericService<
  typeof SuccessTracker,
  ISuccessTracker
> {
  constructor() {
    super(SuccessTracker);
  }
}
