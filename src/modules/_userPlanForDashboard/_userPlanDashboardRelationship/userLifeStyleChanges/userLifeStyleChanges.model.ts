import { model, Schema } from 'mongoose';
import paginate from '../../../../common/plugins/paginate';
import { IUserLifeStyleChanges } from './userLifeStyleChanges.interface';

const userLifeStyleChangesSchema = new Schema<IUserLifeStyleChanges>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [false, 'User is required'],
    },
    lifeStyleChangesId: {
      type: Schema.Types.ObjectId,
      ref: 'Workout',
      required: [false, 'LifeStyleChangesId is required'],
    },
  },
  { timestamps: true }
);

userLifeStyleChangesSchema.plugin(paginate);

// Use transform to rename _id to _projectId
userLifeStyleChangesSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._userLifeStyleChangesId = ret._id; // Rename _id to _projectId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const UserLifeStyleChanges = model<IUserLifeStyleChanges, IUserLifeStyleChanges>('UserLifeStyleChanges', userLifeStyleChangesSchema);
