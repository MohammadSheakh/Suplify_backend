import { model, Schema } from 'mongoose';
import { Iprotocol, IprotocolModel } from './protocol.interface';
import paginate from '../../common/plugins/paginate';


const protocolSchema = new Schema<Iprotocol>(
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

protocolSchema.plugin(paginate);

protocolSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
protocolSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._protocolId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const protocol = model<
  Iprotocol,
  IprotocolModel
>('protocol', protocolSchema);
