import { model, Schema } from 'mongoose';
import { ISuccessTracker, ISuccessTrackerModel } from './successTracker.interface';
import paginate from '../../../common/plugins/paginate';


const SuccessTrackerSchema = new Schema<ISuccessTracker>(
  {
    createdBy: {//🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    mindsetAndMomentumId: {//🔗
      type: Schema.Types.ObjectId,
      ref: 'MindsetAndMomentum',
    },
    satisfactionAndFeedbackId: {//🔗
      type: Schema.Types.ObjectId,
      ref: 'SatisfactionAndFeedback',
    },
    adherenceAndConsistencyId: {//🔗
      type: Schema.Types.ObjectId,
      ref: 'AdherenceAndConsistency',
    },
    healthAndPerformanceId: {//🔗
      type: Schema.Types.ObjectId,
      ref: 'HealthAndPerformance',
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

SuccessTrackerSchema.plugin(paginate);

SuccessTrackerSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
SuccessTrackerSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._SuccessTrackerId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const SuccessTracker = model<
  ISuccessTracker,
  ISuccessTrackerModel
>('SuccessTracker', SuccessTrackerSchema);
