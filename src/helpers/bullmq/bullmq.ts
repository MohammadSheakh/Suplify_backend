//@ts-ignore
import { Queue, Worker, QueueScheduler, Job } from "bullmq"; 
import { DoctorAppointmentSchedule } from "../../modules/scheduleAndAppointmentBooking.module/doctorAppointmentSchedule/doctorAppointmentSchedule.model";
import { TDoctorAppointmentScheduleStatus } from "../../modules/scheduleAndAppointmentBooking.module/doctorAppointmentSchedule/doctorAppointmentSchedule.constant";
import { errorLogger, logger } from "../../shared/logger";
import { DoctorPatientScheduleBooking } from "../../modules/scheduleAndAppointmentBooking.module/doctorPatientScheduleBooking/doctorPatientScheduleBooking.model";
import { TAppointmentStatus } from "../../modules/scheduleAndAppointmentBooking.module/doctorPatientScheduleBooking/doctorPatientScheduleBooking.constant";
import { SpecialistWorkoutClassSchedule } from "../../modules/scheduleAndAppointmentBooking.module/specialistWorkoutClassSchedule/specialistWorkoutClassSchedule.model";
import { TSpecialistWorkoutClassSchedule } from "../../modules/scheduleAndAppointmentBooking.module/specialistWorkoutClassSchedule/specialistWorkoutClassSchedule.constant";
import { SpecialistPatientScheduleBooking } from "../../modules/scheduleAndAppointmentBooking.module/specialistPatientScheduleBooking/specialistPatientScheduleBooking.model";
import { TScheduleBookingStatus } from "../../modules/scheduleAndAppointmentBooking.module/specialistPatientScheduleBooking/specialistPatientScheduleBooking.constant";
import { IDoctorAppointmentSchedule } from "../../modules/scheduleAndAppointmentBooking.module/doctorAppointmentSchedule/doctorAppointmentSchedule.interface";
import { Notification } from "../../modules/notification/notification.model";
import { INotification } from "../../modules/notification/notification.interface";
import { redisPubClient } from "../redis/redis";
import { socketService } from "../socket/socketForChatV3";
import { TRole } from "../../middlewares/roles";
import { Conversation } from "../../modules/chatting.module/conversation/conversation.model";
import { IConversation } from "../../modules/chatting.module/conversation/conversation.interface";
import { ConversationParticipents } from "../../modules/chatting.module/conversationParticipents/conversationParticipents.model";
//@ts-ignore
import mongoose from 'mongoose';


/*-─────────────────────────────────
|  Schedule Queue
└──────────────────────────────────*/
// Create Queue
export const scheduleQueue = new Queue("scheduleQueue", {
  connection: redisPubClient.options, // reuse your redis config
});

//---------------------------------
// If you’re on v5.x or later, QueueScheduler was removed. The functionality is built into Worker now, 
// so you don’t need to use QueueScheduler.
//---------------------------------

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


// 🔎 search for  addToBullQueueToFreeDoctorAppointmentSchedule to see details 

// Create Worker for scheduleQueue
export const startScheduleWorker = () => {
  const worker = new Worker(
    "scheduleQueue",
    async (job:IScheduleJob) => {
      // TODO : add try catch 

      // console.log(`Processing job ${job.id} of type ${job.name}⚡${job.data}`);
      logger.info('Processing job', job.name, " ⚡ ", job.data);

      if (job.name === "makeDoctorAppointmentScheduleAvailable") {

        // console.log("🔎🔎🔎🔎 makeDoctorAppointmentScheduleAvailable ")
        const { scheduleId, appointmentBookingId } = job.data;

        const tomorrow = new Date();
        // const timeForTomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // reset to midnight
        // timeForTomorrow.setUTCDate(timeForTomorrow.getUTCDate() + 1);

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

        await DoctorPatientScheduleBooking.findByIdAndUpdate(appointmentBookingId, {
          $set: {
            status: TAppointmentStatus.completed,
          }
        });


        // console.log(`✅ Schedule ${scheduleId} automatically freed.`);
      }else if (job.name ==="makeDoctorAppointmentScheduleAvailableIfNotBooked"){

        const { scheduleId } = job.data;

        const schedule:IDoctorAppointmentSchedule = await DoctorAppointmentSchedule.findById(scheduleId).select("scheduleStatus");

        if(!schedule){
          console.log(`⚠️ Schedule ${scheduleId} not found.`);
          return;
        }

        if(schedule.scheduleStatus === TDoctorAppointmentScheduleStatus.pending){
          const updatedSchedule:IDoctorAppointmentSchedule = await DoctorAppointmentSchedule.findByIdAndUpdate(scheduleId, {
            $set: { 
              scheduleStatus: TDoctorAppointmentScheduleStatus.available,
              booked_by: null,
            }
          });
        }

      }else if (job.name === "expireDoctorAppointmentScheduleAfterEndTime") {

        const { scheduleId } = job.data;

        /*****
         * 📝
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
          }
        });

        // console.log(`✅ Schedule ${scheduleId} automatically expired at ${new Date().toLocaleString()}.`);
      }else if (job.name === "makeSpecialistWorkoutClassScheduleAvailable") {
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
          // console.log(`⏩ Schedule ${scheduleId} is already available. Skipping job.`);
          return;
        }

        const tomorrow = new Date();
        const timeForTomorrow = new Date()
        
        // TODO : need to think about timezone⏳⌛ here
        
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        timeForTomorrow.setUTCDate(timeForTomorrow.getUTCDate() + 1);

        tomorrow.setUTCHours(0, 0, 0, 0);



        await SpecialistWorkoutClassSchedule.findByIdAndUpdate(scheduleId, {
          $set: { 
              status:  TSpecialistWorkoutClassSchedule.expired,
          }
        });


        /*──────────────────────────────────
        | need to think about this part .. do we need to create a new schedule for next day ?   
        └────────────────────────────────────*/
        
        /*──────────────────────────────────
        | we need batch update here .. as multiple patient can book a workout class   
        └────────────────────────────────────*/
        await SpecialistPatientScheduleBooking.updateMany(
          { workoutClassScheduleId: scheduleId },
          { $set: { status: TScheduleBookingStatus.completed } }
        );

        // console.log(`✅ Schedule ${scheduleId} automatically freed.`);
      }else{
        console.log(`❓ Unknown job type: ${job.name}`);
      }
    },
    {
      connection: redisPubClient.options,
    }
  );
  //@ts-ignore
  worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} (${job.name}) completed`);
  });

  worker.on("failed", (job:IScheduleJob, err:any) => {
    console.error(`❌ Job.id ${job?.id} :: ${job.name} {job.} failed`, err);
    errorLogger.error(`❌ Job.id ${job?.id} :: ${job.name} {job.} failed`, err);
  });
  /********
    // Handle Graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("Shutting down worker...");
      await worker.close();
      await scheduleQueue.close();
      process.exit(0);
    });
  ********** */
}

/*-─────────────────────────────────
|  Notification Queue
└──────────────────────────────────*/
export const notificationQueue = new Queue("notificationQueue-suplify", {
  connection: redisPubClient.options,
});
// new QueueScheduler("notificationQueue", { connection: redisPubClient.options });

type NotificationJobName = "sendNotification";


interface IScheduleJobForNotification {
  name: string;
  data : INotification,
  id: string
}

export const startNotificationWorker = () => {
  const worker = new Worker(
    "notificationQueue-suplify",
    async (
      job: IScheduleJobForNotification
      // job : Job<INotification, any, NotificationJobName>
    ) => {
      console.log("job.data testing startNotificationWorker::", job.data)
      const { id, name, data } = job;
      logger.info(`Processing notification job ${id} ⚡ ${name}`, data);

      try {
        const notif = await Notification.create({
          title: data.title,
          // subTitle: data.subTitle,
          senderId: data.senderId,
          receiverId: data.receiverId,
          receiverRole: data.receiverRole,
          type: data.type,
          linkFor: data.linkFor,
          linkId: data.linkId,
          referenceFor: data.referenceFor,
          referenceId: data.referenceId,
        });

        logger.info(`✅ Notification created for ${data.receiverRole} :: `, notif);
        
        let eventName;
        let emitted;

        // 🎨 GUIDE FOR FRONTEND .. if admin then listen for notification::admin event  
        if(data.receiverRole == TRole.admin){
          
          eventName = `notification::admin`;

          emitted = socketService.emitToRole(
            data.receiverRole,
            eventName,
            {
              title: data.title,
              senderId: data.senderId,
              receiverId: null,
              receiverRole: data.receiverRole,
              type: data.type,
              linkFor: data.linkFor,
              linkId: data.linkId,
              referenceFor: data.referenceFor,
              referenceId: data.referenceId,
            }            
          );

          if (emitted) {
            logger.info(`🔔 Real-time notification sent to ${data.receiverRole}`);
          } else {
            logger.info(`📴 ${data.receiverRole} is offline, notification saved in DB only`);
          }

        }else{
        
          const receiverId = data.receiverId.toString(); // Ensure it's a string
          eventName = `notification::${receiverId}`;

          // Try to emit to the user
          emitted = await socketService.emitToUser(
            receiverId,
            eventName,
            {
              title: data.title,
              senderId: data.senderId,
              receiverId: data.receiverId,
              receiverRole: data.receiverRole,
              type: data.type,
              linkFor: data.linkFor,
              linkId: data.linkId,
              referenceFor: data.referenceFor,
              referenceId: data.referenceId,
            }
          );

          if (emitted) {
            logger.info(`🔔 Real-time notification sent to user ${receiverId}`);
          } else {
            logger.info(`📴 User ${receiverId} is offline, notification saved in DB only`);
          }
        }

      } catch (err: any) {
        console.log("⭕ error block hit  of notification worker", err)
        errorLogger.error(
          `❌ Notification job ${id} failed: ${err.message}`
        );
        throw err; // ensures retry/backoff
      }
    },
    { connection: redisPubClient.options }
  );
  //@ts-ignore
  worker.on("completed", (job) =>
    logger.info(`✅ Notification job ${job.id} (${job.name}) completed`)
  );
  //@ts-ignore
  worker.on("failed", (job, err) =>
    errorLogger.error(`❌ Notification job ${job?.id} (${job?.name}) failed`, err)
  );
};


/*-─────────────────────────────────
|  Update Conversations Last Message Queue
└──────────────────────────────────*/

export const updateConversationsLastMessageQueue = new Queue("updateConversationsLastMessageQueue-suplify", {
  connection: redisPubClient.options,
});

interface IScheduleJobForUpdateConversationsLastMessage {
  name: string;
  data : IConversation, // conversation update er jonno different ekta interface create kore .. sheta use korte hobe .. 
  id: string
}

export const startUpdateConversationsLastMessageWorker = () => {
  const worker = new Worker(
    "updateConversationsLastMessageQueue-suplify",
    async (
      job: IScheduleJobForUpdateConversationsLastMessage
      // job : Job<INotification, any, NotificationJobName>
    ) => {
      console.log("job.data testing startUpdateConversationsLastMessageWorker::", job.data)
      const { id, name, data } = job;
      logger.info(`Processing notification job ${id} ⚡ ${name}`, data);

      try {
        const updatedConversation = await Conversation.findByIdAndUpdate(data.conversationId, {
          lastMessageId: data.lastMessageId,
          lastMessage: data.lastMessage,
        });

        logger.info(`✅ Conversation updated for ${data.conversationId} :: `, updatedConversation);
        
      } catch (err: any) {
        console.log("⭕ error block hit  of notification worker", err)
        errorLogger.error(
          `❌ Notification job ${id} failed: ${err.message}`
        );
        throw err; // ensures retry/backoff
      }
    },
    { connection: redisPubClient.options }
  );
  //@ts-ignore
  worker.on("completed", (job) =>
    logger.info(`✅ Notification job ${job.id} (${job.name}) completed`)
  );
  //@ts-ignore
  worker.on("failed", (job, err) =>
    errorLogger.error(`❌ Notification job ${job?.id} (${job?.name}) failed`, err)
  );
};


/*-─────────────────────────────────
|  Notify All Conversation participants Queue
└──────────────────────────────────*/

export const notifyParticipantsQueue = new Queue<INotifyParticipantsJobData>(
  'notify-participants-queue-suplify',
  { connection: redisPubClient.options }
);

export interface INotifyParticipantsJobData {
  conversationId: string;
  messageId: string;
  messageText: string;
  senderId: string;
  senderProfile: {
    name: string;
    profileImage?: string;
    role?: string;
  };
  participantIds: string[]; // list of all participant user IDs (strings)
}

export const startNotifyParticipantsWorker = () => {
  const worker = new Worker<INotifyParticipantsJobData>(
    'notify-participants-queue-suplify',
    async (job) => {
      const { conversationId, messageId, messageText, senderId, senderProfile, participantIds } = job.data;

      logger.info(`Notifying ${participantIds.length} participants for conversation ${conversationId}`);

      //☑️🟣 Note: We use for...of instead of forEach + async to avoid race conditions and ensure proper error handling per participant.

      // Process each participant
      for (const participantId of participantIds) {
        // if (participantId === senderId) continue; // skip sender // 🆕 as per nirob vai .. 

        try {
          const isOnline = await socketService.isUserOnline(participantId);
          // const isInRoom = await socketService.redisStateManager.isUserInRoom(participantId, conversationId);
          const isInRoom = await socketService.isUserInRoom(participantId, conversationId);

          if (isInRoom) {
            // Emit conversation list update (no unread count bump)
            await socketService.emitToUser(participantId, `conversation-list-updated::${participantId}`, {
              userId: senderProfile,
              conversations: [{
                _conversationId: conversationId,
                lastMessage: messageText,
                updatedAt: new Date(), // or pass timestamp from job if needed
              }],
            });
          } else if (isOnline && !isInRoom) {

            await socketService.emitToUser(participantId, `conversation-list-updated::${participantId}`, {
              userId: senderProfile,
              conversations: [{
                _conversationId: conversationId,
                lastMessage: messageText,
                updatedAt: new Date(),
              }],
            });

            if (participantId === senderId) continue;  // 🆕🆕🆕

            // Update unread count
            const updatedParticipant = await ConversationParticipents.findOneAndUpdate(
              { 
                userId: new mongoose.Types.ObjectId(participantId),
                conversationId: new mongoose.Types.ObjectId(conversationId)
              },
              { 
                $set: { isThisConversationUnseen: 1 },
                // $inc: { unreadCount: 1 }  // ⭕ this is risky ..
                /**
                 * ❌ Why this is dangerous -
                 *  see details chatting.module -> unread-count-issue.md
                 * You are mutating unread count blindly, without knowing whether the message was already read or processed.
                 **/ 
              },
              { new: true }
            );

            // Calculate total unseen conversations
            const [result] = await ConversationParticipents.aggregate([
              { $match: { userId: new mongoose.Types.ObjectId(participantId) } },
              { $group: { _id: null, totalUnseen: { $sum: "$isThisConversationUnseen" } } }
            ]);

            const unreadConversationCount = result?.totalUnseen || 0;

            // Emit both events
            await socketService.emitToUser(participantId, `unseen-count::${participantId}`, {
              unreadConversationCount
            });

            
          }else{
            // If offline → skip (or add push notification later)

            if (participantId === senderId) continue;  // 🆕🆕🆕

            // Update unread count
            const updatedParticipant = await ConversationParticipents.findOneAndUpdate(
              { 
                userId: new mongoose.Types.ObjectId(participantId),
                conversationId: new mongoose.Types.ObjectId(conversationId)
              },
              {
                $set: { isThisConversationUnseen: 1 },
                // $inc: { unreadCount: 1 }  // ⭕ this is risky ..
                /**
                 * ❌ Why this is dangerous -
                 *  see details chatting.module -> unread-count-issue.md
                 * You are mutating unread count blindly, without knowing whether the message was already read or processed.
                 **/ 
              },
              { new: true }
            );

            // Calculate total unseen conversations
            const [result] = await ConversationParticipents.aggregate([
              { $match: { userId: new mongoose.Types.ObjectId(participantId) } },
              { $group: { _id: null, totalUnseen: { $sum: "$isThisConversationUnseen" } } }
            ]);

            const unreadConversationCount = result?.totalUnseen || 0;

            // Emit both events
            await socketService.emitToUser(participantId, `unseen-count::${participantId}`, {
              unreadConversationCount
            });
          }
          
        } catch (err) {
          errorLogger.error(`Failed to notify participant ${participantId}:`, err);
          // Don't throw → continue with others
        }
      }

      return { notified: participantIds.filter(id => id !== senderId) };
    },
    { connection: redisPubClient.options }
  );

  worker.on('completed', (job, result) =>
    logger.info(`✅ Notify job ${job.id} completed. Notified ${result?.notified?.length || 0} users.`)
  );

  worker.on('failed', (job, err) =>
    errorLogger.error(`❌ Notify job ${job.id} failed`, err)
  );
};