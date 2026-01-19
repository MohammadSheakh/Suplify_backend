//@ts-ignore
import { model, Schema } from 'mongoose';
import { ISpecialistPatient, ISpecialistPatientModel } from './specialistPatient.interface';
import paginate from '../../../common/plugins/paginate';
import { TRelationCreatedBy } from '../doctorSpecialistPatient/doctorSpecialistPatient.constant';

const specialistPatientSchema = new Schema<ISpecialistPatient>(
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
    relationCreatedBy : {
      type: String,
      enum : [TRelationCreatedBy],
      required: [false, 'relationCreatedBy is not required'],
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

// Use transform to rename _id to _projectId
specialistPatientSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._specialistPatientId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const SpecialistPatient = model<
  ISpecialistPatient,
  ISpecialistPatientModel
>('SpecialistPatient', specialistPatientSchema);
