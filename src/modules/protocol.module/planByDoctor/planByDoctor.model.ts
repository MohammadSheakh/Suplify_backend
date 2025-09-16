import { model, Schema } from 'mongoose';
import { IPlanByDoctor, IPlanByDoctorModel } from './planByDoctor.interface';
import paginate from '../../../common/plugins/paginate';
import { TPlanByDoctor } from './planByDoctor.constant';


const planByDoctorSchema = new Schema<IPlanByDoctor>(
  {
    planType :{ 
      type: String,
      enum: [
        TPlanByDoctor.lifeStyleChanges,
        TPlanByDoctor.mealPlan,
        TPlanByDoctor.suppliment,
        TPlanByDoctor.workOut
      ],
      required: [true, `planType is required .. it can be  ${Object.values(TPlanByDoctor).join(
        ', '
      )}`],
    },
    createdBy: { //🔗 doctor Id 
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },

    protocolId: { //🔗 for which protocol
      type: Schema.Types.ObjectId,
      ref: 'protocol',
      required: [true, 'protocolId is required'],
    },

    title: {
      type: String,
      required: [true, 'title is required'],
    },
    
    description: {
      type: String,
      required: [true, 'description is required'],
    },
    keyPoints : {
      type: [String],
      required : [true, 'keyPoints are required']
    },
    totalKeyPoints : {
      type: Number,
      required: [true, 'totalKeyPoints is required']
    },
    patientId: { //🔗 for which patient
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

planByDoctorSchema.plugin(paginate);

planByDoctorSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
planByDoctorSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._planByDoctorId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const PlanByDoctor = model<
  IPlanByDoctor,
  IPlanByDoctorModel
>('PlanByDoctor', planByDoctorSchema);
