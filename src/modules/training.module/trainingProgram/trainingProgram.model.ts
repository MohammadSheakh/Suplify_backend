import { model, Schema } from 'mongoose';
import { ITrainingProgram, ITrainingProgramModel } from './trainingProgram.interface';
import paginate from '../../../common/plugins/paginate';


const TrainingProgramSchema = new Schema<ITrainingProgram>(
  {
    programName: {
      type: String,
      required: [true, 'programName is required'],
      trim: true
    },
    durationInMonths: {
      type: Number,
      required: [true, 'durationInMonths is required'],
    },
    totalSessionCount:{ // just for show this value .. not for storing .. 
      type: Number,
      required: [true, 'totalSessionCount is required'],
    },

    price: {
      type: Number,
      required: [true, 'price is required'],
      min: [0, 'price must be positive'],
    },

    createdBy: {  // Refer to Specialist .. who create this training Program .. 
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

TrainingProgramSchema.plugin(paginate);

TrainingProgramSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
TrainingProgramSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._TrainingProgramId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const TrainingProgram = model<
  ITrainingProgram,
  ITrainingProgramModel
>('TrainingProgram', TrainingProgramSchema);
