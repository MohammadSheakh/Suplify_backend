import { StatusCodes } from 'http-status-codes';
import { DoctorPatientScheduleBooking } from './doctorPatientScheduleBooking.model';
import { IDoctorPatientScheduleBooking } from './doctorPatientScheduleBooking.interface';
import { GenericService } from '../../__Generic/generic.services';


export class DoctorPatientScheduleBookingService extends GenericService<
  typeof DoctorPatientScheduleBooking,
  IDoctorPatientScheduleBooking
> {
  constructor() {
    super(DoctorPatientScheduleBooking);
  }
}
