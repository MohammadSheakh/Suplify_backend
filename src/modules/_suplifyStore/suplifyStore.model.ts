import { model, Schema } from 'mongoose';
import {
  OrderStatus,
  OrderType,
} from './suplifyStore.constant';
import { ISuplifyStore, ISuplifyStoreModel } from './suplifyStore.interface';
import paginate from '../../common/plugins/paginate';

const suplifyStoreSchema = new Schema<ISuplifyStore>(
  {
    // 🔥🔥 Update korte hobe full Schema .. 
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User Id is required'],
    },
    totalAmount: {
      type : Number,
      required : [true, 'totalAmount is needed']
    },
    orderType : {
      // TODO: orderType niye chinta korte hboe  🔥🔥
      // like eta ki store er order .. naki training program er order .. 
      // naki virtual workout class er order .. naki 
      // subscription er order ... 

      type : String,
      enum : [
        OrderType.premium,
        OrderType.premium,
        OrderType.premium,
      ],
      required: [
        true,
        `orderType is required it can be ${Object.values(
          OrderType
        ).join(', ')}`,
      ],
    } ,
    orderStatus: {
      type: String,
      enum: [
        OrderStatus.pending,
        OrderStatus.processing,
        OrderStatus.complete,
        OrderStatus.failed,
        OrderStatus.refunded,
      ],
      required: [
        true,
        `OrderStatus is required it can be ${Object.values(
          OrderStatus
        ).join(', ')}`,
      ],
    },
    
    orderNotes: {
      //> One Subscription can have multiple features ...
      type: String,
      required: [false, 'orderNotes is not required'],
    },
    
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

suplifyStoreSchema.plugin(paginate);

// orderSchema.pre('save', function(next) {
//   // Rename _id to _projectId
//   // this._taskId = this._id;
//   // this._id = undefined;  // Remove the default _id field
//   //this.renewalFee = this.initialFee
  
//   next();
// });


// Use transform to rename _id to _projectId
suplifyStoreSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._suplifyStoreId = ret._id;  // Rename _id to _subscriptionId
    delete ret._id;  // Remove the original _id field
    return ret;
  }
});


export const SuplifyStore = model<ISuplifyStore, ISuplifyStoreModel>(
  'SuplifyStore',
  suplifyStoreSchema
);
