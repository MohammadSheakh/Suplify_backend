import { model, Schema } from 'mongoose';
import { IStripeAccounts } from './stripeAccount.interface';

const stripeAccountSchema = new Schema<IStripeAccounts>(
  {
    userId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user id is required'],
    },
    accountId: { //🔗
      type: String,
      required: [true, 'account id is required'],
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

export const StripeAccount = model('StripeAccount', stripeAccountSchema);
