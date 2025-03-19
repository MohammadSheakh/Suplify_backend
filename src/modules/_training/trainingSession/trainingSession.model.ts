import { model, Schema } from 'mongoose';
import {  ITrainingSession, ITrainingSessionModel } from './trainingSession.interface';
import { TrainingSessionStatus } from './trainingSession.constant';
import { TrainingProgramCategory, TrainingProgramType } from '../trainingProgram/trainingProgram.constant';
import paginate from '../../../common/plugins/paginate';

const trainingSessionSchema = new Schema<ITrainingSession>(
  {
    trainingProgramId: {
      type: Schema.Types.ObjectId,
      ref: 'TrainingProgram',
      required: [false, 'Training Program Id is required'],
    },
    title : {
      type: String,
      required: [true, 'PartnerName is required'],
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'Attachments is not required'],
      }
    ],
    // TODO :  time assign kora gele valo hoito .. 
    duration : {
      type: String,
      required: [true, 'Description is required'],
    },
    type : {
      type: String,
      enum: [
        TrainingProgramType.personalTraining,
        TrainingProgramType.groupTraining
        ],
      required: [true, 'type is required it can be personalTraining or groupTraining'],
    },
    meetingLinkType: {
      type: String,
      enum: [
        TrainingProgramCategory.meet,
        TrainingProgramCategory.zoom,
      ],
      required: [true, 'meetingLinkType is required'],
    },
    meetingLinkUrl : {
      type: String,
      required: [true, 'meetingLinkUrl is required'],
    },
    status : {
      type: String,
      enum : [
        TrainingSessionStatus.scheduled,
        TrainingSessionStatus.completed,
        TrainingSessionStatus.active,
        TrainingSessionStatus.postponed,
        TrainingSessionStatus.cancelled,	
      ]
      ,
      required: [true, 'status is required'],

    },
    isDeleted : {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

trainingSessionSchema.plugin(paginate);

// taskSchema.pre('save', function(next) {
//   // Rename _id to _projectId
//   this._taskId = this._id;
//   this._id = undefined;  // Remove the default _id field
//   next();
// });


// Use transform to rename _id to _projectId
trainingSessionSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._trainingSessionId = ret._id;  // Rename _id to _projectId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});


export const TrainingSession = model<ITrainingSession, ITrainingSessionModel>(
  'TrainingSession',
  trainingSessionSchema
);
