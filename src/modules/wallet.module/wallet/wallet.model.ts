import { model, Schema } from 'mongoose';
import { IWallet, IWalletModel } from './Wallet.interface';
import paginate from '../../common/plugins/paginate';


const WalletSchema = new Schema<IWallet>(
  {
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      required: [true, 'dateOfBirth is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

WalletSchema.plugin(paginate);

WalletSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
WalletSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._WalletId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const Wallet = model<
  IWallet,
  IWalletModel
>('Wallet', WalletSchema);
