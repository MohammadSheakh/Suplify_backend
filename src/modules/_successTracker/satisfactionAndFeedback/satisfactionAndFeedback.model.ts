import { model, Schema } from 'mongoose';
import { ISatisfactionAndFeedback, ISatisfactionAndFeedbackModel } from './SatisfactionAndFeedback.interface';
import paginate from '../../common/plugins/paginate';


const SatisfactionAndFeedbackSchema = new Schema<ISatisfactionAndFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      required: [true, 'dateOfBirth is required'],
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
