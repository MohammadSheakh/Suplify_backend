//@ts-ignore
import { Queue, Worker } from "bullmq";
import { redisPubClient } from "./redis"; 
import { DoctorAppointmentSchedule } from "../modules/scheduleAndAppointmentBooking.module/doctorAppointmentSchedule/doctorAppointmentSchedule.model";
import { TDoctorAppointmentScheduleStatus } from "../modules/scheduleAndAppointmentBooking.module/doctorAppointmentSchedule/doctorAppointmentSchedule.constant";
import { logger } from "../shared/logger";
import { DoctorPatientScheduleBooking } from "../modules/scheduleAndAppointmentBooking.module/doctorPatientScheduleBooking/doctorPatientScheduleBooking.model";
import { TAppointmentStatus } from "../modules/scheduleAndAppointmentBooking.module/doctorPatientScheduleBooking/doctorPatientScheduleBooking.constant";

// Create Queue
export const scheduleQueue = new Queue("scheduleQueue", {
  connection: redisPubClient.options, // reuse your redis config
});

interface IScheduleJob {
  name: string;
  data :{
    scheduleId: string; // doctorAppointmentSchedule
    appointmentBookingId:string; // doctorAppointmentBooking
  }
}

// Create Worker
export const scheduleWorker = new Worker(
  "scheduleQueue",
  async (job:IScheduleJob) => {
    console.log(`Processing job ${job.id} of type ${job.name}⚡${job.data}`);
    logger.info('Processing job', job.name, " ⚡ ", job.data);

    if (job.name === "makeDoctorAppointmentScheduleAvailable") {
      const { scheduleId, appointmentBookingId } = job.data;

      await DoctorAppointmentSchedule.findByIdAndUpdate(scheduleId, {
        $set: { 
            scheduleStatus: TDoctorAppointmentScheduleStatus.available,
            booked_by: null
        }
      });

      await DoctorPatientScheduleBooking.findByIdAndUpdate(appointmentBookingId, {
        $set: {
          status: TAppointmentStatus.completed,
        }
      });

      console.log(`✅ Schedule ${scheduleId} automatically freed.`);
    }
  },
  {
    connection: redisPubClient.options,
  }
);

scheduleWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed`, err);
});