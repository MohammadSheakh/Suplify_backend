import { model, Schema } from 'mongoose';
import { IClientDocuments, IClientDocumentsModel } from './clientDocuments.interface';
import paginate from '../../common/plugins/paginate';


const ClientDocumentsSchema = new Schema<IClientDocuments>(
  {
    
    title: {
      type: String,
      required: [false, 'title is not required'],
    },
    description: {
      type: String,
      required: [false, 'description is not required'],
    },
    attachments: [//🔗
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [true, 'Attachments is required'],
      }
    ],
    patientId: { //🔗 who upload the document
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

ClientDocumentsSchema.plugin(paginate);



// Use transform to rename _id to _projectId
ClientDocumentsSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._ClientDocumentsId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const ClientDocuments = model<
  IClientDocuments,
  IClientDocumentsModel
>('ClientDocuments', ClientDocumentsSchema);
