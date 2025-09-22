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
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // reset to midnight

      await DoctorAppointmentSchedule.findByIdAndUpdate(scheduleId, {
        $set: { 
            scheduleStatus: TDoctorAppointmentScheduleStatus.available,
            booked_by: null,
            scheduleDate: tomorrow
        }
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
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // reset to midnight

      await SpecialistWorkoutClassSchedule.findByIdAndUpdate(scheduleId, {
        $set: { 
            scheduleStatus: TSpecialistWorkoutClassSchedule.available,
            scheduleDate: tomorrow
        }
      });

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