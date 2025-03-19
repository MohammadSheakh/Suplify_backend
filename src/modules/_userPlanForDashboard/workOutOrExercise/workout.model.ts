import { model, Schema } from 'mongoose';
import { WorkoutCategoryType, WorkoutTypeType } from './workout.constant';
import { IWorkout, IworkoutModel } from './workout.interface';
import paginate from '../../../common/plugins/paginate';

const workoutSchema = new Schema<IWorkout>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [true, 'Attachments is required'],
      },
    ],
    description: {
      type: String,
      required: [true, 'description is required'],
    },

    // ${lifeStyleChangesCategory.join(', ') } // TODO : pore test korte hobe
    category: {
      enum: [WorkoutCategoryType.normal, WorkoutCategoryType.specialized],
      type: String,
      required: [false, 'category is required. It can be normal / specialized'],
    },
    // ISSUE : type er dorkar nai i think ..
    type: {
      //   type: Schema.Types.ObjectId,
      //   ref: 'Project',
      type: String,
      enum: [WorkoutTypeType.free, WorkoutTypeType.paid],
      required: [false, 'type is required . it can be free / paid'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

workoutSchema.plugin(paginate);

// Use transform to rename _id to _projectId
workoutSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._attachmentId = ret._id; // Rename _id to _projectId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Workout = model<IWorkout, IworkoutModel>('Workout', workoutSchema);
