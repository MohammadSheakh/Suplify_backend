import { model, Schema } from 'mongoose';
import { IDoctorSpecialistPatient, IDoctorSpecialistPatientModel } from './doctorSpecialistPatient.interface';
import paginate from '../../../common/plugins/paginate';

const doctorSpecialistPatientSchema = new Schema<IDoctorSpecialistPatient>(
  {
    doctorId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'doctorId is required'],
    },
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

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

doctorSpecialistPatientSchema.plugin(paginate);

// Use transform to rename _id to _projectId
doctorSpecialistPatientSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._doctorSpecialistPatientId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const DoctorSpecialistPatient = model<
  IDoctorSpecialistPatient,
  IDoctorSpecialistPatientModel
>('DoctorSpecialistPatient', doctorSpecialistPatientSchema);
