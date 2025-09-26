//@ts-ignore
import { model, Schema } from 'mongoose';
import { ISatisfactionAndFeedback, ISatisfactionAndFeedbackModel } from './satisfactionAndFeedback.interface';
import paginate from '../../../common/plugins/paginate';

const SatisfactionAndFeedbackSchema = new Schema<ISatisfactionAndFeedback>(
  {

    successTrackerId: {
      type: Schema.Types.ObjectId,
      ref: 'SuccessTracker',
      required: true
    },


    areYouHappyWithCurrentProgress: {
      type: Boolean,
      required: [true, 'areYouHappyWithCurrentProgress is required'],
    },
    doYouFeelSupported: {
      type: Boolean,
      required: [true, 'doYouFeelSupported is required'],
    },
    oneThingYouNeedHelpWith: {
      type: String,
      maxLength: 500,
      required: [true, 'oneThingYouNeedHelpWith is required'],
    },
    oneHabitYouImprovedOrBuiltThisWeek: {
      type: String,
      maxLength: 500,
      required: [true, 'oneHabitYouImprovedOrBuiltThisWeek is required'],
    },
    wouldYouRecommendUs: {
      type: Boolean,
      required: [true, 'wouldYouRecommendUs is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

SatisfactionAndFeedbackSchema.plugin(paginate);

SatisfactionAndFeedbackSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
SatisfactionAndFeedbackSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._SatisfactionAndFeedbackId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const SatisfactionAndFeedback = model<
  ISatisfactionAndFeedback,
  ISatisfactionAndFeedbackModel
>('SatisfactionAndFeedback', SatisfactionAndFeedbackSchema);
