//@ts-ignore
import { model, Schema } from 'mongoose';
import { IRequestForViseSubscriptionToAdmin, IRequestForViseSubscriptionToAdminModel } from './requestForViseSubscriptionToAdmin.interface';
import paginate from '../../../common/plugins/paginate';
import { THireStatus } from './requestForViseSubscriptionToAdmin.constant';

const RequestForViseSubscriptionToAdminSchema = new Schema<IRequestForViseSubscriptionToAdmin>(
  {
    patientId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    status : {
      type: String,
      enum : [THireStatus],
      default: THireStatus.pending,
      required: [false, 'status is not required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

RequestForViseSubscriptionToAdminSchema.plugin(paginate);

// Use transform to rename _id to _projectId
RequestForViseSubscriptionToAdminSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._RequestForViseSubscriptionToAdminId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const RequestForViseSubscriptionToAdmin = model<
  IRequestForViseSubscriptionToAdmin,
  IRequestForViseSubscriptionToAdminModel
>('RequestForViseSubscriptionToAdmin', RequestForViseSubscriptionToAdminSchema);
