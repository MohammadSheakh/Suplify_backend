import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import { ISupliment, ISuplimentModel } from './supliment.interface';


const suplimentSchema = new Schema<ISupliment>(
  {
    name : {
      type : String,
      required: [true, 'name is required'],
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
    },
    description: {
      type: String,
      required: [false, 'description is not required'],
    },
    stockQty : {
      type : Number,
      required : [true, 'stockQty is needed']
    },
    ingredients: {
      type: String,
      required: [false, 'ingredients is not required'],
    },
    dosageInstruction: {
      type: String,
      required: [false, 'dosageInstruction is not required'],
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'Attachments is not required'],
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

suplimentSchema.plugin(paginate);

suplimentSchema.pre('save', function(next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee
  
  next();
});


// Use transform to rename _id to _projectId
suplimentSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._suplimentId = ret._id;  // Rename _id to _subscriptionId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});


export const Supliment = model<ISupliment, ISuplimentModel>(
  'Supliment',
  suplimentSchema
);
