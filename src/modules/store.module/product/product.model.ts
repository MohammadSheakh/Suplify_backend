import { model, Schema } from 'mongoose';
import { IProduct, IProductModel } from './product.interface';
import paginate from '../../../common/plugins/paginate';
import { TProductCategory } from './product.constant';


const ProductSchema = new Schema<IProduct>(
  {
    // userId: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    // },
    name: {
      type: String,
      required: [true, 'name is required'],
    },
    attachments: [  //🔗
      {
          type: Schema.Types.ObjectId,
          ref: 'Attachment',
          required: [false, 'attachments is not required'],
      }
    ],
    description: {
      type: String,
      required: [true, 'description is required'],
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
    },
    category: {
      type: String,
      enum:[
        TProductCategory.fitness,
        TProductCategory.labTest,
        TProductCategory.supplement,
        TProductCategory.wellness,
        TProductCategory.others // not sure .. others should be an option or not 
      ],
      required: [true, 'category is required'],
    },
    stockQuantity:{
      type: Number,
      required: [true, 'stockQuantity is required'],
    },
    /************
     * 
     * Size, Color
     * 
     * Need to add later  
     * 
     * ********** */
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

ProductSchema.plugin(paginate);

ProductSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
ProductSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._ProductId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Product = model<
  IProduct,
  IProductModel
>('Product', ProductSchema);
