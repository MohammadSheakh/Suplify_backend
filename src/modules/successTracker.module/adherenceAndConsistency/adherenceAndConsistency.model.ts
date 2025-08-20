import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import { IAdherenceAndConsistency, IAdherenceAndConsistencyModel } from './adherenceAndConsistency.interface';


const AdherenceAndConsistencySchema = new Schema<IAdherenceAndConsistency>(
  {
    didYouTakeSupplimentsAsRecommended: {
      type: Number,
      required: [true, 'didYouTakeSupplimentsAsRecommended is required'],
    },
    howManyMealsDidYouFollow: {
      type: Number,
      required: [true, 'howManyMealsDidYouFollow is required'],
    },
    workoutDidYouCompleteThisWeek: {
      type: Number,
      required: [true, 'workoutDidYouCompleteThisWeek is required'],
    },
    howConsistentWithHydration: {
      type: Number,
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
