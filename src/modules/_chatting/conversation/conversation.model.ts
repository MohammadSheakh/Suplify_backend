import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import { IConversation, IConversationModel } from './conversation.interface';
import { ConversationType } from './conversation.constant';

const conversationSchema = new Schema<IConversation>(
  {
    creatorId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User Id is required'],
    },
    type: {
          type: String,
          enum: [
            ConversationType.direct,
            ConversationType.group,
          ],
          required: [
            true,
            `ConversationType is required it can be ${Object.values(
              ConversationType
            ).join(', ')}`,
          ],
        },

    attachedToId: {
      // 🔥 fix korte hobe ... eita 
      type: Schema.Types.ObjectId,
      ref: 'TrainingProgram',
      required: [true, 'title is required'],
    },
    attachedToCategory : {
      // 🔥 fix korte hobe ... eita 
      type: String,
      enum: [
        'TrainingProgram',
        'VirtualWorkoutClass',
      ],
      required: [true, 'title is required'],
    }
   ,
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

conversationSchema.plugin(paginate);

conversationSchema.pre('save', function(next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee
  
  next();
});


// Use transform to rename _id to _projectId
conversationSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._virtualWorkoutClassId = ret._id;  // Rename _id to _subscriptionId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});


export const Conversation = model<IConversation, IConversationModel>(
  'Conversation',
  conversationSchema
);
