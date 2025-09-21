import { StatusCodes } from 'http-status-codes';
import { SpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.model';
import { ISpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { toLocalTime, toUTCTime } from '../../../utils/timezone';

export class SpecialistWorkoutClassScheduleService extends GenericService<
  typeof SpecialistWorkoutClassSchedule,
  ISpecialistWorkoutClassSchedule
> {
  constructor() {
    super(SpecialistWorkoutClassSchedule);
  }

  async createV2(data:ISpecialistWorkoutClassSchedule, userTimeZone: string) : Promise<ISpecialistWorkoutClassSchedule> {
      /********
       * 📝
       * Here first we have to check 
       * scheduleDate , startTime , endTime
       * -------------------------------
       * date time valid or not 
       * ****** */
      if(data.scheduleDate && data.startTime && data.endTime) {
          const scheduleDate = new Date(data.scheduleDate);
          
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
  
          // Check for overlapping schedules for the same specialist
          const overlappingSchedule = await SpecialistWorkoutClassSchedule.findOne({
              createdBy: data.createdBy,
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
          
          startTime: toLocalTime(createdDoc.startTime, userTimeZone),
          endTime:  toLocalTime(createdDoc.endTime, userTimeZone),
      };
  
      return transformedDoc;
  
    }
}
