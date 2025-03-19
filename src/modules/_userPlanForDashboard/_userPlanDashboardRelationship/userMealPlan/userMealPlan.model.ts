import { model, Schema } from 'mongoose';

import paginate from '../../../../common/plugins/paginate';
import { IUserMealPlan, IuserMealPlanModel } from './userMealPlan.interface';

const userMealPlanSchema = new Schema<IUserMealPlan>(
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

userMealPlanSchema.plugin(paginate);

// Use transform to rename _id to _projectId
userMealPlanSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._userWorkoutId = ret._id; // Rename _id to _projectId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const UserMealPlan = model<IUserMealPlan, IuserMealPlanModel>('UserMealPlan', userMealPlanSchema);
