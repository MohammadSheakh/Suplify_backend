//@ts-ignore
import { model, Schema } from 'mongoose';
import { INotification, INotificationModal } from './notification.interface';
import paginate from '../../common/plugins/paginate';
import { Roles } from '../../middlewares/roles';

const notificationModel = new Schema<INotification>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    subTitle: {
      type: String,
      trim: true,
    },

    senderId: { // who triggered the notification
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    receiverId: { // specific user (doctor, specialist, patient)
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    receiverRole: { // fallback for role-based (admin, doctor, specialist, patient)
      type: String,
      enum: Roles,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "BOOKING",       // patient booked doctor schedule
        "TRAINING",      // patient booked specialist training
        "WORKOUT",       // patient booked workout class
        "WITHDRAWAL",    // doctor/specialist requested withdrawal
        "PAYMENT",       // payment credited/debited
        "SYSTEM",        // admin/system announcement
      ],
      required: true,
    },

    referenceFor: {
      type: String,
      enum: [
        "Schedule",
        "TrainingProgram",
        "WorkoutClass",
        "WithdrawalRequest",
        "PaymentTransaction",
        "Order",
      ],
    },

    referenceId: {
      type: Schema.Types.ObjectId,
      refPath: "referenceFor",
    },

    viewStatus: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationModel.plugin(paginate);

export const Notification = model<INotification, INotificationModal>(
  'Notification',
  notificationModel
);
