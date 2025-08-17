import { model, Schema } from 'mongoose';
import { IinformationVideo, IinformationVideoModel } from './informationVideo.interface';
import paginate from '../../common/plugins/paginate';


const informationVideoSchema = new Schema<IinformationVideo>(
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

informationVideoSchema.plugin(paginate);

informationVideoSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
informationVideoSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._informationVideoId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const informationVideo = model<
  IinformationVideo,
  IinformationVideoModel
>('informationVideo', informationVideoSchema);
