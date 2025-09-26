import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import { IAdherenceAndConsistency, IAdherenceAndConsistencyModel } from './adherenceAndConsistency.interface';


const AdherenceAndConsistencySchema = new Schema<IAdherenceAndConsistency>(
  {

    successTrackerId: {
      type: Schema.Types.ObjectId,
      ref: 'SuccessTracker',
      required: true
    },

    didYouTakeSupplimentsAsRecommended: {
      type: Number,
      min: 0,
      max: 100,
      required: [true, 'didYouTakeSupplimentsAsRecommended is required'],
    },
    howManyMealsDidYouFollow: {
      type: Number,
       min: 0,
      required: [true, 'howManyMealsDidYouFollow is required'],
    },
    workoutDidYouCompleteThisWeek: {
      type: Number,
      min: 0,
      required: [true, 'workoutDidYouCompleteThisWeek is required'],
    },
    howConsistentWithHydration: {
      type: Number,
      min: 1,
      max: 10,

      required: [true, 'howConsistentWithHydration is required'],
    },
    checkInWithCoachThisWeek: {
      type: Boolean,
      required: [true, 'checkInWithCoachThisWeek is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

AdherenceAndConsistencySchema.plugin(paginate);

AdherenceAndConsistencySchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
AdherenceAndConsistencySchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._AdherenceAndConsistencyId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const AdherenceAndConsistency = model<
  IAdherenceAndConsistency,
  IAdherenceAndConsistencyModel
>('AdherenceAndConsistency', AdherenceAndConsistencySchema);
