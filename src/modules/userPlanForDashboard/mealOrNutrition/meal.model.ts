import { model, Schema } from 'mongoose';

import { IMeal, ImealModel } from './meal.interface';
import paginate from '../../../common/plugins/paginate';

const mealSchema = new Schema<IMeal>(
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

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

mealSchema.plugin(paginate);

// Use transform to rename _id to _projectId
mealSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._mealId = ret._id; // Rename _id to _projectId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Meal = model<IMeal, ImealModel>('Meal', mealSchema);
