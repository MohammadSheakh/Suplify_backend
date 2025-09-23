//@ts-ignore
import { Queue, Worker, QueueScheduler } from "bullmq";
import { redisPubClient } from "./redis"; 
import { DoctorAppointmentSchedule } from "../modules/scheduleAndAppointmentBooking.module/doctorAppointmentSchedule/doctorAppointmentSchedule.model";
import { TDoctorAppointmentScheduleStatus } from "../modules/scheduleAndAppointmentBooking.module/doctorAppointmentSchedule/doctorAppointmentSchedule.constant";
import { errorLogger, logger } from "../shared/logger";
import { DoctorPatientScheduleBooking } from "../modules/scheduleAndAppointmentBooking.module/doctorPatientScheduleBooking/doctorPatientScheduleBooking.model";
import { TAppointmentStatus } from "../modules/scheduleAndAppointmentBooking.module/doctorPatientScheduleBooking/doctorPatientScheduleBooking.constant";
import { SpecialistWorkoutClassSchedule } from "../modules/scheduleAndAppointmentBooking.module/specialistWorkoutClassSchedule/specialistWorkoutClassSchedule.model";
import { TSpecialistWorkoutClassSchedule } from "../modules/scheduleAndAppointmentBooking.module/specialistWorkoutClassSchedule/specialistWorkoutClassSchedule.constant";
import { SpecialistPatientScheduleBooking } from "../modules/scheduleAndAppointmentBooking.module/specialistPatientScheduleBooking/specialistPatientScheduleBooking.model";
import { TScheduleBookingStatus } from "../modules/scheduleAndAppointmentBooking.module/specialistPatientScheduleBooking/specialistPatientScheduleBooking.constant";
import { IDoctorAppointmentSchedule } from "../modules/scheduleAndAppointmentBooking.module/doctorAppointmentSchedule/doctorAppointmentSchedule.interface";

// Create Queue
export const scheduleQueue = new Queue("scheduleQueue", {
  connection: redisPubClient.options, // reuse your redis config
});

// new QueueScheduler("scheduleQueue", {
//   connection: redisPubClient.options,
// });

interface IScheduleJob {
  name: string;
  data :{
    scheduleId: string; // doctorAppointmentSchedule
    appointmentBookingId:string; // doctorAppointmentBooking
  },
  id: string
}

// Create Worker
export const startScheduleWorker = () => {
const worker = new Worker(
  "scheduleQueue",
  async (job:IScheduleJob) => {
    // TODO : add try catch 

    console.log(`Processing job ${job.id} of type ${job.name}⚡${job.data}`);
    logger.info('Processing job', job.name, " ⚡ ", job.data);

    if (job.name === "makeDoctorAppointmentScheduleAvailable") {

      console.log("🔎🔎🔎🔎 makeDoctorAppointmentScheduleAvailable ")
      const { scheduleId, appointmentBookingId } = job.data;

      const tomorrow = new Date();
      const timeForTomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // reset to midnight

      timeForTomorrow.setUTCDate(timeForTomorrow.getUTCDate() + 1); 
      /*****
       * 📝
       * For start Time and endTime .. we only manupulate date thing .. not time .. 
       * 
       * its not possible to update the same schedule with new time .. because its create 
       * complexity in further booking for same person 
       * 
       * so .. solution is to create a new schedule with new date and time
       * and update the old one as expired 
       * 
       * TODO: 
       * later we can create a cron job to delete all expired schedule after 7 days or so
       * 
       * *** */
       
      const updatedSchedule:IDoctorAppointmentSchedule = await DoctorAppointmentSchedule.findByIdAndUpdate(scheduleId, {
        $set: { 
          scheduleStatus: 
          // TDoctorAppointmentScheduleStatus.available,
          TDoctorAppointmentScheduleStatus.expired,
          booked_by: null,
          // scheduleDate: tomorrow,
          // startTime: timeForTomorrow,
          // endTime: timeForTomorrow,
        }
      });

      /****
       * lets create another 
       * ** */

      updatedSchedule && await DoctorAppointmentSchedule.create({
        createdBy: updatedSchedule.createdBy,
        scheduleName: updatedSchedule.scheduleName,
        scheduleDate: tomorrow,
        startTime: timeForTomorrow,
        endTime: timeForTomorrow,

        description: updatedSchedule.description,
        price: updatedSchedule.price,
        typeOfLink: updatedSchedule.typeOfLink,
        meetingLink: updatedSchedule.meetingLink,
        scheduleStatus: TDoctorAppointmentScheduleStatus.available,
      });

      await DoctorPatientScheduleBooking.findByIdAndUpdate(appointmentBookingId, {
        $set: {
          status: TAppointmentStatus.completed,
        }
      });

      console.log(`✅ Schedule ${scheduleId} automatically freed.`);
    }else if (job.name === "makeSpecialistWorkoutClassScheduleAvailable") {
      console.log("🔎🔎🔎🔎 makeSpecialistWorkoutClassScheduleAvailable ")
      const { scheduleId } = job.data; 
      /***
       * we dont need booking id here as multiple patient can book a workout class
       * we will update all the booking status to completed where workoutClassScheduleId = scheduleId
       *
       ** */


      // Fetch schedule first
      const schedule = await SpecialistWorkoutClassSchedule.findById(scheduleId);

      // ✅ If schedule is already available, exit early
      if (!schedule) {
        console.log(`⚠️ Schedule ${scheduleId} not found.`);
        return;
      }

      if (schedule.status === TSpecialistWorkoutClassSchedule.available) {
        console.log(`⏩ Schedule ${scheduleId} is already available. Skipping job.`);
        return;
      }

      const tomorrow = new Date();
      const timeForTomorrow = new Date()
      
      // TODO : need to think about timezone⏳⌛ here
      // tomorrow.setDate(tomorrow.getDate() + 1);
      // tomorrow.setHours(0, 0, 0, 0); // reset to midnight


      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      timeForTomorrow.setUTCDate(timeForTomorrow.getUTCDate() + 1);

      tomorrow.setUTCHours(0, 0, 0, 0);



      await SpecialistWorkoutClassSchedule.findByIdAndUpdate(scheduleId, {
        $set: { 
            status:  TSpecialistWorkoutClassSchedule.expired,
            // TSpecialistWorkoutClassSchedule.available,
            // scheduleDate: tomorrow,
            // startTime: timeForTomorrow,
            // endTime: timeForTomorrow,
        }
      });

      /******
       * need to think about this part .. do we need to create a new schedule for next day ?
       * *** */

      /*****
       * 
       * we need batch update here .. as multiple patient can book a workout class
       *
       ****** */
      await SpecialistPatientScheduleBooking.updateMany(
        { workoutClassScheduleId: scheduleId },
        { $set: { status: TScheduleBookingStatus.completed } }
      );

      // await SpecialistPatientScheduleBooking.findByIdAndUpdate(workoutClassBookingId, {
      //   $set: {
      //     status: TScheduleBookingStatus.completed,
      //   }
      // });

      console.log(`✅ Schedule ${scheduleId} automatically freed.`);
    }else{
      console.log(`❓ Unknown job type: ${job.name}`);
    }
  },
  {
    connection: redisPubClient.options,
  }
);


worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} (${job.name}) completed`);
});

worker.on("failed", (job:IScheduleJob, err:any) => {
  console.error(`❌ Job.id ${job?.id} :: ${job.name} {job.} failed`, err);
  errorLogger.error(`❌ Job.id ${job?.id} :: ${job.name} {job.} failed`, err);
});
}