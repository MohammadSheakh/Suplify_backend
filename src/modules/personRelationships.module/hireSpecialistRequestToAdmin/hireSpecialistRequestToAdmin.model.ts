//@ts-ignore
import { model, Schema } from 'mongoose';
import { IHireSpecialistRequestToAdmin, IHireSpecialistRequestToAdminModel } from './hireSpecialistRequestToAdmin.interface';
import paginate from '../../../common/plugins/paginate';
import { THireStatus } from './hireSpecialistRequestToAdmin.constant';

const HireSpecialistRequestToAdminSchema = new Schema<IHireSpecialistRequestToAdmin>(
  {
    patientId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    specialistId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'specialistId is required'],
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

HireSpecialistRequestToAdminSchema.plugin(paginate);

HireSpecialistRequestToAdminSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
HireSpecialistRequestToAdminSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._HireSpecialistRequestToAdminId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const HireSpecialistRequestToAdmin = model<
  IHireSpecialistRequestToAdmin,
  IHireSpecialistRequestToAdminModel
>('HireSpecialistRequestToAdmin', HireSpecialistRequestToAdminSchema);
