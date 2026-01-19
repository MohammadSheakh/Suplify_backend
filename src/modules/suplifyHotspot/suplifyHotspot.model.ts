//@ts-ignore
import { model, Schema } from 'mongoose';
import { ISuplifyHotspot, ISuplifyHotspotModel } from './suplifyHotspot.interface';
import paginate from '../../common/plugins/paginate';


const SuplifyHotspotSchema = new Schema<ISuplifyHotspot>(
  {
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'hotspot name is required'],
    },

    attachments: [//🔗🖼️
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'attachments is not required'],
      }
    ],

    address: {
      type: String,
      required: [true, 'address is required'],
    },

    lat: {
      type: String,
      required: [false, 'Latitude is required'],
    },
    long: {
      type: String,
      required: [false, 'Longitude is required'],
    },

    // location: {
    //   type: {
    //     type: String,
    //     enum: ['Point'],
    //     required: false,
    //     default: 'Point'
    //   },
    //   coordinates: {
    //     type: [Number], // [longitude, latitude]
    //     required: false,
    //     validate: {
    //       validator: (v: number[]) => v.length === 2,
    //       message: 'Coordinates must be [longitude, latitude]'
    //     }
    //   }
    // },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

SuplifyHotspotSchema.plugin(paginate);

// Use transform to rename _id to _projectId
SuplifyHotspotSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._SuplifyHotspotId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const SuplifyHotspot = model<
  ISuplifyHotspot,
  ISuplifyHotspotModel
>('SuplifyHotspot', SuplifyHotspotSchema);

