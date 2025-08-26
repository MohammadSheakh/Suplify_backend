import { StatusCodes } from 'http-status-codes';
import { SuccessTracker } from './successTracker.model';
import { ISuccessTracker } from './successTracker.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class SuccessTrackerService extends GenericService<
  typeof SuccessTracker,
  ISuccessTracker
> {
  constructor() {
    super(SuccessTracker);
  }
}
