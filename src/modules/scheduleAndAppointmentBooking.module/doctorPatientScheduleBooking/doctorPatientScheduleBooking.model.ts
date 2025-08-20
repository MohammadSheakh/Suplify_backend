import { model, Schema } from 'mongoose';
import { IDoctorPatientScheduleBooking, IDoctorPatientScheduleBookingModel } from './doctorPatientScheduleBooking.interface';
import paginate from '../../../common/plugins/paginate';
import { TAppointmentStatus } from './doctorPatientScheduleBooking.constant';


const DoctorPatientScheduleBookingSchema = new Schema<IDoctorPatientScheduleBooking>(
  {
    patientId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    doctorScheduleId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'DoctorAppointmentSchedule',
      required: [true, 'doctorScheduleId is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
    status: {
      type : String,
      enum: [
        TAppointmentStatus.scheduled,
        TAppointmentStatus.completed,
        TAppointmentStatus.cancelled
      ],
      default: TAppointmentStatus.scheduled,
      required: [true, 'status is required'],
    },
  },
  { timestamps: true }
);

DoctorPatientScheduleBookingSchema.plugin(paginate);

DoctorPatientScheduleBookingSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
DoctorPatientScheduleBookingSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._DoctorPatientScheduleBookingId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const DoctorPatientScheduleBooking = model<
  IDoctorPatientScheduleBooking,
  IDoctorPatientScheduleBookingModel
>('DoctorPatientScheduleBooking', DoctorPatientScheduleBookingSchema);
