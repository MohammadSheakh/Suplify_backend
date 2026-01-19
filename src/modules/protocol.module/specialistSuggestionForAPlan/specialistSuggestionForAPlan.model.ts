import { model, Schema } from 'mongoose';
import { ISpecialistSuggestionForAPlan, ISpecialistSuggestionForAPlanModel } from './specialistSuggestionForAPlan.interface';
import paginate from '../../../common/plugins/paginate';


const SpecialistSuggestionForAPlanSchema = new Schema<ISpecialistSuggestionForAPlan>(
  {
    suggestionId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'SuggestionBySpecialist',
      required: [true, 'suggestionId is required'],
    },
    planId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'planId is required'],
    },
    createdBy: { //🔗 Specialist Id // 
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

SpecialistSuggestionForAPlanSchema.plugin(paginate);

// Use transform to rename _id to _projectId
SpecialistSuggestionForAPlanSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._SpecialistSuggestionForAPlanId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const SpecialistSuggestionForAPlan = model<
  ISpecialistSuggestionForAPlan,
  ISpecialistSuggestionForAPlanModel
>('SpecialistSuggestionForAPlan', SpecialistSuggestionForAPlanSchema);
