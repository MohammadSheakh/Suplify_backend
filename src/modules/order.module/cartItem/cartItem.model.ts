import { model, Schema } from 'mongoose';
import { ICartItem, ICartItemModel } from './cartItem.interface';
import paginate from '../../../common/plugins/paginate';
import { EProduct } from '../../store.module/product/product.model';


const CartItemSchema = new Schema<ICartItem>(
  {
    cartId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Cart',
    },
    itemId: { //🔗
      // 🔥 confusion ase ... eta ki relational hobe naki non relational hobe 
      type: Schema.Types.ObjectId,
      ref: EProduct.Product, // 🔥 Product nam e kono table e nai amader .. 
      required: [true, 'itemId is required'],
    },
    
    quantity : {
      type: Number, 
      required: [true, 'quantity is required.. which is a number'],
    },
    
    //---------------------------------
    // we dont store unit price here .. as unit price can varry .. 
    //---------------------------------

    //---------------------------------
    // also we dont store total price here .. as unit price can varry ..  
    //---------------------------------
    
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

CartItemSchema.plugin(paginate);

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
