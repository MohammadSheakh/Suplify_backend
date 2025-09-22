//@ts-ignore
import { model, Schema } from 'mongoose';
import { ISpecialistWorkoutClassSchedule, ISpecialistWorkoutClassScheduleModel } from './specialistWorkoutClassSchedule.interface';
import paginate from '../../../common/plugins/paginate';
import { TMeetingLink, TSession, TSpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.constant';

const SpecialistWorkoutClassScheduleSchema = new Schema<ISpecialistWorkoutClassSchedule>(
  {
    createdBy: { //🔗 ref to a specialist
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    scheduleName: {
      type: String,
      required: [true, 'scheduleName is required'],
    },
    scheduleDate: {
      type: Date,
      required: [true, 'scheduleDate is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'startTime is required . type is Date'],
    },
    endTime: {
      type: Date,
      required: [true, 'endTime is required . type is Date'],
    },
    description : {
      type: String,
      required: [true, 'description is required'],
    },
    status: {
      type: String,
      enum: [
        TSpecialistWorkoutClassSchedule.available,
        TSpecialistWorkoutClassSchedule.booked,
        TSpecialistWorkoutClassSchedule.cancelled,
      ],
      default: TSpecialistWorkoutClassSchedule.available,
      required: [true, `status is required .. it can be  ${Object.values(TSpecialistWorkoutClassSchedule).join(
        ', '
      )}`],
    },
    price : {
      type: Number,
      required: [true, 'price is required'],
    },
    typeOfLink: {
      type: String,
      enum: [
        TMeetingLink.zoom,
        TMeetingLink.googleMeet,
        TMeetingLink.others
      ],
      required: [true, `status is required .. it can be  ${Object.values(TMeetingLink).join(
        ', '
      )}`],
    },
    sessionType: {
      type: String,
      enum: [
        TSession.private,
        TSession.group
      ],
      required: [true, `sessionType is required .. it can be  ${Object.values(TSession).join(
        ', '
      )}`],   
    },
    meetingLink:{
      type : String,
      required: [true, 'meetingLink is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

SpecialistWorkoutClassScheduleSchema.plugin(paginate);

SpecialistWorkoutClassScheduleSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
SpecialistWorkoutClassScheduleSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._SpecialistWorkoutClassScheduleId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const SpecialistWorkoutClassSchedule = model<
  ISpecialistWorkoutClassSchedule,
  ISpecialistWorkoutClassScheduleModel
>('SpecialistWorkoutClassSchedule', SpecialistWorkoutClassScheduleSchema);
