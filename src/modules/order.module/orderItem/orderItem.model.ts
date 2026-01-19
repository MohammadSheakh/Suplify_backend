//@ts-ignore
import { model, Schema } from 'mongoose';
import paginate from '../../../common/plugins/paginate';
import { IOrderItem, IOrderItemModel } from './orderItem.interface';

const orderItemSchema = new Schema<IOrderItem>(
  {
    orderId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order Id is required'],
    },
    itemId: { //🔗
      // 🔥 confusion ase ... eta ki relational hobe naki non relational hobe 
      type: Schema.Types.ObjectId,
      ref: 'Product', // 🔥 Product nam e kono table e nai amader .. 
      required: [true, 'itemId is required'],
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
    //---------------------------------
    // do we really need totalPrice for a product
    //---------------------------------
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

orderItemSchema.plugin(paginate);


// Use transform to rename _id to _projectId
orderItemSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._subscriptionId = ret._id;  // Rename _id to _subscriptionId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});


export const OrderItem = model<IOrderItem, IOrderItemModel>(
  'OrderItem',
  orderItemSchema
);
