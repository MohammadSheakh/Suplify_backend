import { model, Schema } from 'mongoose';
import { ICart, ICartModel } from './cart.interface';
import paginate from '../../../common/plugins/paginate';

const CartSchema = new Schema<ICart>(
  {
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    itemCount: {
      type: Number,
      required: [true, 'itemCount is required'],
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

CartSchema.plugin(paginate);

CartSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
CartSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._CartId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Cart = model<
  ICart,
  ICartModel
>('Cart', CartSchema);
