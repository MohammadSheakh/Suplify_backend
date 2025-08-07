import { StatusCodes } from 'http-status-codes';
import { DoctorAppointmentSchedule } from './DoctorAppointmentSchedule.model';
import { IDoctorAppointmentSchedule } from './DoctorAppointmentSchedule.interface';
import { GenericService } from '../__Generic/generic.services';


export class DoctorAppointmentScheduleService extends GenericService<
  typeof DoctorAppointmentSchedule,
  IDoctorAppointmentSchedule
> {
  constructor() {
    super(DoctorAppointmentSchedule);
  }
}
