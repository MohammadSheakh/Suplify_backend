//@ts-ignore
import { model, Schema } from 'mongoose';
import { IMindsetAndMomentum, IMindsetAndMomentumModel } from './mindsetAndMomentum.interface';
import paginate from '../../../common/plugins/paginate';


const MindsetAndMomentumSchema = new Schema<IMindsetAndMomentum>(
  {

    successTrackerId: {
      type: Schema.Types.ObjectId,
      ref: 'SuccessTracker',
      required: true
    },

    howMotivatedDoYouFeel: {
      type: Number,
      min: 1,
    max: 10,
      required: [true, 'howMotivatedDoYouFeel is required'],
    },
    oneWinFromPastWeekThatYourProudOf: {
      type: String,
      maxLength: 500,
      required: [true, 'oneWinFromPastWeekThatYourProudOf is required'],
    },
    biggestChallengeofThisWeek: {
      type: String,
      maxLength: 500,
      required: [true, 'biggestChallengeofThisWeek is required'],
    },
    oneHabitYouImprovedOrBuiltThisWeek: {
      type: String,
      maxLength: 500,
      required: [true, 'oneHabitYouImprovedOrBuiltThisWeek is required'],
    },
    howConfidentAreYou: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, 'howConfidentAreYou is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

MindsetAndMomentumSchema.plugin(paginate);

MindsetAndMomentumSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
MindsetAndMomentumSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._MindsetAndMomentumId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const MindsetAndMomentum = model<
  IMindsetAndMomentum,
  IMindsetAndMomentumModel
>('MindsetAndMomentum', MindsetAndMomentumSchema);
