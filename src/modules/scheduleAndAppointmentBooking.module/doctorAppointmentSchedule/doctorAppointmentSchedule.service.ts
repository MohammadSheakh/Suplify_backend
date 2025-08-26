import { StatusCodes } from 'http-status-codes';
import { DoctorAppointmentSchedule } from './doctorAppointmentSchedule.model';
import { IDoctorAppointmentSchedule } from './doctorAppointmentSchedule.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class DoctorAppointmentScheduleService extends GenericService<
  typeof DoctorAppointmentSchedule,
  IDoctorAppointmentSchedule
> {
  constructor() {
    super(DoctorAppointmentSchedule);
  }
}
