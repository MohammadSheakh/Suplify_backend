import { model, Schema } from 'mongoose';
import {
  LifeStyleChangesCategoryType,
  LifeStyleChangesTypeType,
} from './lifeStyleChanges.constant';
import {
  ILifeStyleChanges,
  IlifeStyleChangesModel,
} from './lifeStyleChanges.interface';
import paginate from '../../../common/plugins/paginate';

const lifeStyleChangesSchema = new Schema<ILifeStyleChanges>(
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
      enum: [
        LifeStyleChangesCategoryType.normal,
        LifeStyleChangesCategoryType.specialized,
      ],
      type: String,
      required: [false, 'category is required. It can be normal / specialized'],
    },
    // ISSUE : type er dorkar nai i think ..
    type: {
      //   type: Schema.Types.ObjectId,
      //   ref: 'Project',
      type: String,
      enum: [LifeStyleChangesTypeType.free, LifeStyleChangesTypeType.paid],
      required: [false, 'type is required . it can be free / paid'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

lifeStyleChangesSchema.plugin(paginate);

// Use transform to rename _id to _projectId
lifeStyleChangesSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._lifeStyleChangesId = ret._id; // Rename _id to _projectId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const LifeStyleChanges = model<
  ILifeStyleChanges,
  IlifeStyleChangesModel
>('LifeStyleChanges', lifeStyleChangesSchema);
