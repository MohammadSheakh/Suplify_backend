//@ts-ignore
import { model, Schema } from 'mongoose';
import { IinformationVideo, IinformationVideoModel } from './informationVideo.interface';
import paginate from '../../../common/plugins/paginate';

const informationVideoSchema = new Schema<IinformationVideo>(
  {
    thumbnail: [ //🔗
      {
          type: Schema.Types.ObjectId,
          ref: 'Attachment',
          required: [false, 'thumbnail is not required'],
      }
    ],
    video: [ //🔗
      {
          type: Schema.Types.ObjectId,
          ref: 'Attachment',
          required: [false, 'video is not required'],
      }
    ],
    videoLink: {
      type: String,
      required: [false, 'videoLink is not required'],
    },
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    description: {
      type: String,
      required: [true, 'description is required'],
    },
    createdBy: { //🔗 specialistId
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
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
