import { model, Schema } from 'mongoose';
import { IAssessmentAnswer, IAssessmentAnswerModel } from './assessmentAnswer.interface';
import paginate from '../../../common/plugins/paginate';
import { TAssessmentAnswer } from './assessmentAnswer.constant';


const AssessmentAnswerSchema = new Schema<IAssessmentAnswer>(
  {
    
    questionId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, 'questionId is required'],
    },
    
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },

    answerValue: {
      type: Schema.Types.Mixed,
      required: [true, 'answerValue is required'],
    },
    answerType: {
      type: String,
      enum: [
        TAssessmentAnswer.text,
        TAssessmentAnswer.number,
        TAssessmentAnswer.single,
        TAssessmentAnswer.multi,
        TAssessmentAnswer.scale,
      ],
      required: [
        true,
        `answerType is required it can be ${Object.values(TAssessmentAnswer).join(', ')}`,
      ],
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

AssessmentAnswerSchema.plugin(paginate);

// Use transform to rename _id to _projectId
AssessmentAnswerSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._AssessmentAnswerId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const AssessmentAnswer = model<
  IAssessmentAnswer,
  IAssessmentAnswerModel
>('AssessmentAnswer', AssessmentAnswerSchema);
