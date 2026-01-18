//@ts-ignore
import { model, Schema } from 'mongoose';
import { IDoctorPlan, IDoctorPlanModel } from './doctorPlan.interface';
import paginate from '../../../common/plugins/paginate';
import { TPlanByDoctor } from '../planByDoctor/planByDoctor.constant';


const DoctorPlanSchema = new Schema<IDoctorPlan>(
  {
    planType :{ 
      type: String,
      enum: [
        TPlanByDoctor.lifeStyleChanges,
        TPlanByDoctor.mealPlan,
        TPlanByDoctor.suppliment,
        TPlanByDoctor.workOut,
        TPlanByDoctor.labTest,
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

    title: {
      type: String,
      required: [true, 'title is required'],
    },
    
    description: {
      type: String,
      required: [false, 'description is not required'],
    },
    keyPoints : {
      type: [String],
      required : [false, 'keyPoints are not required']
    },
    totalKeyPoints : { // based on keypoints length // auto calculate .. 
      type: Number,
      required: [true, 'totalKeyPoints is required']
    },

    // 🆕
    link: {
      type: String,
      required: [false, 'link is not required'],
    },
    
    // 🆕
    attachments: [  //🔗
      {
          type: Schema.Types.ObjectId,
          ref: 'Attachment',
          required: [false, 'attachments is not required'],
      }
    ],
    
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

DoctorPlanSchema.plugin(paginate);

DoctorPlanSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
DoctorPlanSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._DoctorPlanId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const DoctorPlan = model<
  IDoctorPlan,
  IDoctorPlanModel
>('DoctorPlan', DoctorPlanSchema);
