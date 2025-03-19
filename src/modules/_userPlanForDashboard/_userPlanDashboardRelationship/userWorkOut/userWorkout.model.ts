import { model, Schema } from 'mongoose';

import { IUserWorkout, IuserWorkoutModel } from './userWorkout.interface';
import paginate from '../../../../common/plugins/paginate';

const userWorkoutSchema = new Schema<IUserWorkout>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [false, 'User is required'],
    },
    workoutId: {
      type: Schema.Types.ObjectId,
      ref: 'Workout',
      required: [false, 'MealPlan is required'],
    },
  },
  { timestamps: true }
);

userWorkoutSchema.plugin(paginate);

// Use transform to rename _id to _projectId
userWorkoutSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._userWorkoutId = ret._id; // Rename _id to _projectId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const UserWorkout = model<IUserWorkout, IuserWorkoutModel>('UserWorkout', userWorkoutSchema);
