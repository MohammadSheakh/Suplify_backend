import { model, Schema } from 'mongoose';
import { LifeStyleChangesCategoryType, LifeStyleChangesType, LifeStyleChangesTypeType } from './lifeStyleChanges.constant';

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
        }
    ],
    description: {
        type: String,
        required: [true, 'description is required'],
    },

    category : {
      enum: [
        LifeStyleChangesCategoryType.normal,
        LifeStyleChangesCategoryType.specialized,
      ],
      type: String,
      required: [false, 'category is required. It can be normal / specialized'],
    },
    type: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Project',
    type: String,
    enum: [
        LifeStyleChangesTypeType.free,
        LifeStyleChangesTypeType.paid,
      ],
      required: [false, 'type is required . it can be free / paid'],
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
    reactions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
      }
    ],
  },
  { timestamps: true }
);

lifeStyleChangesSchema.plugin(paginate);

// Use transform to rename _id to _projectId
lifeStyleChangesSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._attachmentId = ret._id;  // Rename _id to _projectId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});


export const LifeStyleChanges = model<ILifeStyleChanges, lifeStyleChangesModel>(
  'LifeStyleChanges',
  lifeStyleChangesSchema
);