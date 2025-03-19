import { model, Schema } from 'mongoose';
import { IRrainingProgram, ITRrainingProgramModel } from './trainingProgram.interface';
import { TrainingProgramCategory, TrainingProgramType } from './trainingProgram.constant';
import paginate from '../../../common/plugins/paginate';

const trainingProgramSchema = new Schema<IRrainingProgram>(
  {
    name : {
      type: String,
      required: [true, 'name is required'],
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'Attachments is not required'],
      }
    ],
    totalTrainingCount : {
      type: Number,
      required: [true, 'totalTrainingCount is required'],
    },
    price : {
      type: Number,
      required: [true, 'price is required'],
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
    
    isDeleted : {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

trainingProgramSchema.plugin(paginate);

// taskSchema.pre('save', function(next) {
//   // Rename _id to _projectId
//   this._taskId = this._id;
//   this._id = undefined;  // Remove the default _id field
//   next();
// });


// Use transform to rename _id to _projectId
trainingProgramSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._trainingProgramId = ret._id;  // Rename _id to _projectId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});


export const TrainingProgram = model<IRrainingProgram, ITRrainingProgramModel>(
  'TrainingProgram',
  trainingProgramSchema
);
