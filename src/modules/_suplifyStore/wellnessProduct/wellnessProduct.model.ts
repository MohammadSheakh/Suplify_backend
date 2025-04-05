import { model, Schema } from 'mongoose';

import { IWellnessProduct, IWellnessProductModel } from './wellnessProduct.interface';
import paginate from '../../../common/plugins/paginate';

const wellnessProductSchema = new Schema<IWellnessProduct>(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
    },
    description: {
      type: String,
      required: [true, 'description is required'],
    },
    category: {
      type: String,
      required: [false, 'category is not required'],
    },
    // category: { //🔗
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: [true, 'User Id is required'],
    // },
    type: {
      type: String,
      required: [true, 'type is required'],
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
    },
    stockQty: {
      type : Number,
      required : [true, 'stockQty is needed']
    },
    
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

wellnessProductSchema.plugin(paginate);

wellnessProductSchema.pre('save', function(next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee
  
  next();
});


// Use transform to rename _id to _projectId
wellnessProductSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._wellnessProductId = ret._id;  // Rename _id to _subscriptionId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});


export const WellnessProduct = model<IWellnessProduct, IWellnessProductModel>(
  'WellnessProduct',
  wellnessProductSchema
);
