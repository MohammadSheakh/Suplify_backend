import { model, Schema } from 'mongoose';
import { ITrainingSession, ITrainingSessionModel } from './trainingSession.interface';
import paginate from '../../../common/plugins/paginate';
import { TDurationUnit } from './trainingSession.constant';

const TrainingSessionSchema = new Schema<ITrainingSession>(
  {
    trainingProgramId: { //🔗 as training program can have multiple training session
      type: Schema.Types.ObjectId,
      ref: 'TrainingProgram', //🧪🧪🧪 check korte hobe thik ase kina .. 
      required: [true, 'trainingProgramId is required'],
    },
    sessionCount: { // 🟡 
      /****
       * session create korar time e .. 
       * automatically we have to calculate and 
       * assign this one .. 
       * 
       * we have to check how many training session
       * already created .. 
       * 
       * so that we can we can know the actual count for 
       * this one 
       * **** */ 
      type: Number,
      required: [true, 'sessionCount is required'],
    },
    title: { // 🟡 why we need this ? 
      type: String,
      required: [true, 'title is required'],
    },
    duration : {
      type : String, // 🟡 is this should be string or number ..  
      required: [true, 'duration is required'],
    },
    durationUnit:{
      type: String,
      enum:[
        TDurationUnit.hours,
        TDurationUnit.minutes
      ],
    },
    benefits : {
      type: [String],
      required: [true, 'benefits are required'],
    },
    tokenCount: {
      type: Number,
      required: [false, 'token is required'],
      default: 1,
    },

    coverPhotos: [//🔗🖼️
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'coverPhotos is not required'],
      }
    ],

    attachments: [//🔗🖼️
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'attachments is not required'],
      }
    ],
    // Attachments or external links 
    external_link: {
      type: String,
      required: [false, 'external_link is not required'],
    },

    trailerContents: [//🔗🖼️
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'trailerContent is not required'],
      }
    ],

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

TrainingSessionSchema.plugin(paginate);

TrainingSessionSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
TrainingSessionSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._TrainingSessionId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const TrainingSession = model<
  ITrainingSession,
  ITrainingSessionModel
>('TrainingSession', TrainingSessionSchema);
