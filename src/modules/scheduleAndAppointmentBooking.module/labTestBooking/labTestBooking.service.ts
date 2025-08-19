import { StatusCodes } from 'http-status-codes';
import { ILabTestBooking } from './LabTestBooking.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { LabTestBooking } from './labTestBooking.model';


export class LabTestBookingService extends GenericService<
  typeof LabTestBooking,
  ILabTestBooking
> {
  constructor() {
    super(LabTestBooking);
  }
}
