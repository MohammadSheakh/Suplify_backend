import { model, Schema } from 'mongoose';
import { ISuccessTracker, ISuccessTrackerModel } from './successTracker.interface';
import paginate from '../../../common/plugins/paginate';


const SuccessTrackerSchema = new Schema<ISuccessTracker>(
  {
    createdBy: {//🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    weekStartDate: {
      type: Date,
      required: true
    },
    weekEndDate: {
      type: Date,
      required: true
    },

    // successTrackerId: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'SuccessTracker',
    //   required: true
    // },

    // mindsetAndMomentumId: {//🔗
    //   type: Schema.Types.ObjectId,
    //   ref: 'MindsetAndMomentum',
    // },
    // satisfactionAndFeedbackId: {//🔗
    //   type: Schema.Types.ObjectId,
    //   ref: 'SatisfactionAndFeedback',
    // },
    // adherenceAndConsistencyId: {//🔗
    //   type: Schema.Types.ObjectId,
    //   ref: 'AdherenceAndConsistency',
    // },
    // healthAndPerformanceId: {//🔗
    //   type: Schema.Types.ObjectId,
    //   ref: 'HealthAndPerformance',
    // },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

SuccessTrackerSchema.plugin(paginate);

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
