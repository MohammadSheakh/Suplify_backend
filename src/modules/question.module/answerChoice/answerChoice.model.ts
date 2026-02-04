import { model, Schema } from 'mongoose';
import { IAnswerChoice, IAnswerChoiceModel } from './answerChoice.interface';
import paginate from '../../../common/plugins/paginate';


const AnswerChoiceSchema = new Schema<IAnswerChoice>(
  {
    answerTitle: {
      type: String,
      required: [true, 'answerTitle is required'],
    },
    questionId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, 'questionId is required'],
    },
    
    
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

AnswerChoiceSchema.plugin(paginate);

// Use transform to rename _id to _projectId
AnswerChoiceSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._AnswerChoiceId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const AnswerChoice = model<
  IAnswerChoice,
  IAnswerChoiceModel
>('AnswerChoice', AnswerChoiceSchema);
