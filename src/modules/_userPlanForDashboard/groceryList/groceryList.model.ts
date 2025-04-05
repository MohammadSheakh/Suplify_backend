import { model, Schema } from 'mongoose';

import paginate from '../../../common/plugins/paginate';
import { IGroceryList, IGroceryListModel } from './groceryList.interface';

const groceryListSchema = new Schema<IGroceryList>(
  {
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User Id is required'],
    },
    productId: { //🔗
      // this can be suppliment Id... 
      type: Schema.Types.ObjectId,
      ref: 'SuplifyStore',
      required: [false, 'User Id is required'],
    },
    
    name: {
      type: String,
      required: [true, 'description is required'],
    },
    description: {
      type: String,
      required: [true, 'description is required'],
    },

    
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

groceryListSchema.plugin(paginate);

// Use transform to rename _id to _projectId
groceryListSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._lifeStyleChangesId = ret._id; // Rename _id to _projectId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const GroceryList = model<
  IGroceryList,
  IGroceryListModel
>('GroceryList', groceryListSchema);
