import { model, Schema } from 'mongoose';
import { ISuccessTracker, ISuccessTrackerModel } from './successTracker.interface';
import paginate from '../../../common/plugins/paginate';


const SuccessTrackerSchema = new Schema<ISuccessTracker>(
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
