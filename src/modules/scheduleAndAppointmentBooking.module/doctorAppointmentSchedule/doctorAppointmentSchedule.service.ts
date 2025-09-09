//@ts-ignore
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

  async create(data:IDoctorAppointmentSchedule) : Promise<IDoctorAppointmentSchedule> {
    /********
     * 📝
     * Here first we have to check 
     * scheduleDate , startTime , endTime
     * -------------------------------
     * date time valid or not 
     * ****** */
    if(data.scheduleDate && data.startTime && data.endTime) {
        const scheduleDate = new Date(data.scheduleDate);
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);

        if(isNaN(scheduleDate.getTime()) || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new Error('Invalid date or time format');
        }
        
        if(startTime >= endTime) {
            throw new Error('Start time must be before end time');
        }
        const now = new Date();
        if(startTime < now) {
            throw new Error('Start time must be in the future');
        }

        // Check for overlapping schedules for the same doctor
        const overlappingSchedule = await DoctorAppointmentSchedule.findOne({
            doctorId: data.createdBy,
            scheduleDate: scheduleDate,
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        if(overlappingSchedule) {
            throw new Error('Overlapping schedule exists for the doctor');
        }
    } else {
        throw new Error('scheduleDate, startTime and endTime are required');
    }
    return await this.model.create(data);
  }
}

