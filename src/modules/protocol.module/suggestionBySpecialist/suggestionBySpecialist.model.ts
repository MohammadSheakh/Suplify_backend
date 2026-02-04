//@ts-ignore
import { model, Schema } from 'mongoose';
import { ISuggestionBySpecialist, ISuggestionBySpecialistModel } from './suggestionBySpecialist.interface';
import paginate from '../../../common/plugins/paginate';


const SuggestionBySpecialistSchema = new Schema<ISuggestionBySpecialist>(
  {
    keyPoint:{
      type: String,
      required: [false, 'keyPoint is required']
    },
    solutionName: {
      type: String,
      required : [false, 'solutionName is required']
    },
    suggestFromStore: {
      type: String,
      required: [false, 'suggestFromStore is required'],
    },

    // 🆕
    link: {
      type: String,
      required: [false, 'link is not required'],
    },

    // 🆕 //--------- sorry we can not add this attachments here .. 
    attachments: [  //🔗
      {
          type: Schema.Types.ObjectId,
          ref: 'Attachment',
          required: [false, 'attachments is not required'],
      }
    ],

    createdBy: { //🔗 Specialist Id 
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

SuggestionBySpecialistSchema.plugin(paginate);

// Use transform to rename _id to _projectId
SuggestionBySpecialistSchema.set('toJSON', {
  transform: function (doc:any, ret:any, options:any) {
    ret._SuggestionBySpecialistId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const SuggestionBySpecialist = model<
  ISuggestionBySpecialist,
  ISuggestionBySpecialistModel
>('SuggestionBySpecialist', SuggestionBySpecialistSchema);
