//@ts-ignore
import { model, Schema } from 'mongoose';
import { IBankInfo, IBankInfoModel } from './bankInfo.interface';
import paginate from '../../../common/plugins/paginate';
import { TBankAccount } from './bankInfo.constant';

const BankInfoSchema = new Schema<IBankInfo>(
  {
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    bankAccountNumber: {
      type: String,
      required: [true, 'bankAccountNumber is required'],
    },

    bankRoutingNumber: {
      type: String,
      required: [true, 'bankRoutingNumber is required'],
    },

    bankAccountHolderName: {
      type: String,
      required: [true, 'bankAccountHolderName is required'],
    },

    bankAccountType: {
      type: String,
      enum : [TBankAccount.savings, TBankAccount.current],
      required: [true, 'bankAccountType is required'],
    },

    bankBranch: {
      type: String,
      required: [true, 'bankBranch is required'],
    },

    bankName: {
      type: String,
      required: [true, 'bankName is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

BankInfoSchema.plugin(paginate);

BankInfoSchema.pre('save', function (next) {
  // Rename _id to _projectId
  // this._taskId = this._id;
  // this._id = undefined;  // Remove the default _id field
  //this.renewalFee = this.initialFee

  next();
});

// Use transform to rename _id to _projectId
BankInfoSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret._BankInfoId = ret._id; // Rename _id to _subscriptionId
    delete ret._id; // Remove the original _id field
    return ret;
  },
});

export const BankInfo = model<
  IBankInfo,
  IBankInfoModel
>('BankInfo', BankInfoSchema);
