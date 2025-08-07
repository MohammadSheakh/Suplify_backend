import { StatusCodes } from 'http-status-codes';
import { DoctorPatientScheduleBooking } from './DoctorPatientScheduleBooking.model';
import { IDoctorPatientScheduleBooking } from './DoctorPatientScheduleBooking.interface';
import { GenericService } from '../__Generic/generic.services';


export class DoctorPatientScheduleBookingService extends GenericService<
  typeof DoctorPatientScheduleBooking,
  IDoctorPatientScheduleBooking
> {
  constructor() {
    super(DoctorPatientScheduleBooking);
  }
}
