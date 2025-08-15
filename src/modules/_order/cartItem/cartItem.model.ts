import { model, Schema } from 'mongoose';
import { ICartItem, ICartItemModel } from './CartItem.interface';
import paginate from '../../common/plugins/paginate';


const CartItemSchema = new Schema<ICartItem>(
  {
    cartId: {
      type: Schema.Types.ObjectId,
      ref: 'Cart',
    },
    itemId: { //🔗
      // 🔥 confusion ase ... eta ki relational hobe naki non relational hobe 
      type: Schema.Types.ObjectId,
      ref: 'Product', // 🔥 Product nam e kono table e nai amader .. 
      required: [true, 'itemId is required'],
    },
    itemType :{
      type : String,
      required: [true, 'itemType is required'],
    },
    itemName :{
      type : String,
      required: [true, 'itemName is required'],
    },
    quantity : {
      type: Number, 
      required: [true, 'quantity is required.. which is a number'],
    },
    unitPrice : {
      type: Number,
      required : [true, 'unitPrice is required.. which is a number'],
      min: [0, 'unitPrice must be greater than zero'],
    },
    /*******
     * do we really need totalPrice for a product
     * ****** */
    totalPrice : {
      type: Number,
      required : [true, 'totalPrice is required.. which is a number'],
      min: [0, 'totalPrice must be greater than zero'],
    },
    
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

CartItemSchema.plugin(paginate);

CartItemSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
CartItemSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._CartItemId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const CartItem = model<
  ICartItem,
  ICartItemModel
>('CartItem', CartItemSchema);
