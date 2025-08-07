import { model, Schema } from 'mongoose';
import { IspecialistPatient, IspecialistPatientModel } from './specialistPatient.interface';
import paginate from '../../../common/plugins/paginate';


const specialistPatientSchema = new Schema<IspecialistPatient>(
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

specialistPatientSchema.plugin(paginate);

specialistPatientSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
specialistPatientSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._specialistPatientId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const specialistPatient = model<
  IspecialistPatient,
  IspecialistPatientModel
>('specialistPatient', specialistPatientSchema);
