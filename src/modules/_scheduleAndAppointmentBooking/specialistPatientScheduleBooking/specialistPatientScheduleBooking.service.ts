import { StatusCodes } from 'http-status-codes';
import { SpecialistPatientScheduleBooking } from './SpecialistPatientScheduleBooking.model';
import { ISpecialistPatientScheduleBooking } from './SpecialistPatientScheduleBooking.interface';
import { GenericService } from '../__Generic/generic.services';


export class SpecialistPatientScheduleBookingService extends GenericService<
  typeof SpecialistPatientScheduleBooking,
  ISpecialistPatientScheduleBooking
> {
  constructor() {
    super(SpecialistPatientScheduleBooking);
  }
}
