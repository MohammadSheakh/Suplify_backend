//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { DoctorAppointmentSchedule } from './doctorAppointmentSchedule.model';
import { IDoctorAppointmentSchedule } from './doctorAppointmentSchedule.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { zonedTimeToUtc } from 'date-fns-tz';
import { DateTime } from 'luxon';
import { toLocalTime, toUTCTime } from '../../../utils/timezone';

export class DoctorAppointmentScheduleService extends GenericService<
  typeof DoctorAppointmentSchedule,
  IDoctorAppointmentSchedule
> {
  constructor() {
    super(DoctorAppointmentSchedule);
  }

  async createV2(data:IDoctorAppointmentSchedule, userTimeZone: string) : Promise<IDoctorAppointmentSchedule> {
    /********
     * 📝
     * Here first we have to check 
     * scheduleDate , startTime , endTime
     * -------------------------------
     * date time valid or not 
     * ****** */
    if(data.scheduleDate && data.startTime && data.endTime) {
        const scheduleDate = new Date(data.scheduleDate);
        // const startTime = new Date(data.startTime);
        // const endTime = new Date(data.endTime);
        // const startTime = zonedTimeToUtc(data.startTime, 'Asia/Dhaka');
        // const endTime = zonedTimeToUtc(data.endTime, 'Asia/Dhaka');

        
        // Convert local time string (e.g., "2025-09-10T12:40:00") to UTC Date object
        // const startTime = DateTime.fromISO(data.startTime, { zone: 'Asia/Dhaka' })
        // .toUTC()
        // .toJSDate();
        // const endTime = DateTime.fromISO(data.endTime, { zone: 'Asia/Dhaka' })
        // .toUTC()
        // .toJSDate();

        data.startTime = toUTCTime(data.startTime, userTimeZone);
        data.endTime = toUTCTime(data.endTime, userTimeZone);

        if(isNaN(scheduleDate.getTime()) || isNaN(data.startTime.getTime()) || isNaN(data.endTime.getTime())) {
            throw new Error('Invalid date or time format');
        }

        if(data.startTime >= data.endTime) {
            throw new Error('Start time must be before end time');
        }
        const now = new Date();
        if(data.startTime < now) {
            throw new Error('Start time must be in the future');
        }

        // Check for overlapping schedules for the same doctor
        const overlappingSchedule = await DoctorAppointmentSchedule.findOne({
            doctorId: data.createdBy,
            scheduleDate: scheduleDate,
            $or: [
                {
                    startTime: { $lt: data.endTime },
                    endTime: { $gt: data.startTime }
                }
            ]
        });

        if(overlappingSchedule) {
            throw new Error('Overlapping schedule exists for the doctor');
        }
    } else {
        throw new Error('scheduleDate, startTime and endTime are required');
    }
    const createdDoc = await this.model.create(data);

    // Convert back to user's timezone before returning
    const transformedDoc = {
        ...createdDoc.toObject(), // or .toJSON() if you prefer
        // startTime: DateTime.fromJSDate(createdDoc.startTime)
        //     .setZone('Asia/Dhaka')
        //     .toFormat("yyyy-MM-dd'T'HH:mm:ss"),
        // endTime: createdDoc.endTime
        //     ? DateTime.fromJSDate(createdDoc.endTime)
        //         .setZone('Asia/Dhaka')
        //         .toFormat("yyyy-MM-dd'T'HH:mm:ss")
        //     : null,
        startTime: toLocalTime(createdDoc.startTime, userTimeZone),
        endTime:  toLocalTime(createdDoc.endTime, userTimeZone),
    };

    return transformedDoc;

  }
}

