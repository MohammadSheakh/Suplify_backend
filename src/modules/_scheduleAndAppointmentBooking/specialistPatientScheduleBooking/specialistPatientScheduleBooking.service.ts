import { StatusCodes } from 'http-status-codes';
import { SpecialistPatientScheduleBooking } from './specialistPatientScheduleBooking.model';
import { ISpecialistPatientScheduleBooking } from './specialistPatientScheduleBooking.interface';
import { GenericService } from '../../__Generic/generic.services';


export class SpecialistPatientScheduleBookingService extends GenericService<
  typeof SpecialistPatientScheduleBooking,
  ISpecialistPatientScheduleBooking
> {
  constructor() {
    super(SpecialistPatientScheduleBooking);
  }
}
