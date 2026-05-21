//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { Wallet } from './wallet.model';
import { IWallet } from './wallet.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { WalletTransactionHistory } from '../walletTransactionHistory/walletTransactionHistory.model';
import { TWalletTransactionHistory, TWalletTransactionStatus } from '../walletTransactionHistory/walletTransactionHistory.constant';
import { TCurrency } from '../../../enums/payment';
import { TWalletStatus } from './wallet.constant';
import { User } from '../../user/user.model';


export class WalletService extends GenericService<
  typeof Wallet,
  IWallet
> {
  constructor() {
    super(Wallet);
  }

  //-------------------------------------------------
  // Add Amount to Wallet and Create Wallet Transaction History
  // 🔗➡️ stripeWebhook -> handlePaymentSucceeded() -> updatePurchaseTrainingProgram()
  //-------------------------------------------------
  async addAmountToWalletAndCreateTransactionHistory(userId: string,
    amount: number,
    paymentTransactionId : string,
    description : string, // description helps us to know what is this transaction for
    referenceFor : string,
    referenceId : string,
  ) : Promise<void> {
  
    let wallet : IWallet | null = await Wallet.findOne({ userId });
    
    if (!wallet) {
        //---------------------------------
        // If wallet doesn't exist, create one
        //---------------------------------
        wallet = await Wallet.create({
            userId,
            amount: 0,
            currency: TCurrency.usd,
            status: TWalletStatus.active
        });
        
        // Also update the User model with this walletId
        await User.findByIdAndUpdate(userId, { walletId: wallet._id });
        
        console.log(`✅ Created new wallet for user ${userId}`);
    }

    const balanceBeforeTransaction = wallet.amount;
    const balanceAfterTransaction = wallet.amount + amount;

    console.log("wallet -> ", wallet ," ::", "balanceBeforeTransaction -> ", balanceBeforeTransaction, " :: ", "balanceAfterTransaction -> ", balanceAfterTransaction);

    const updatedWallet : IWallet | null = await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { amount } },
        { new: true }
    );

    if (!updatedWallet) {
        // Handle missing wallet
        throw new Error(`For Specialist Id ${userId} wallet not found so ${amount} can not be added to wallet.`);
    }

    const walletTransactionHistory = await WalletTransactionHistory.create({
      walletId : updatedWallet._id,
      userId : userId,
      paymentTransactionId : paymentTransactionId, 
      withdrawalRequestId : null, // as this is not withdrawal request
      type : TWalletTransactionHistory.credit,
      amount : amount,
      currency : TCurrency.usd,
      balanceBefore : balanceBeforeTransaction,
      balanceAfter : balanceAfterTransaction,
      description : description,
      status : TWalletTransactionStatus.completed,
      referenceFor,
      referenceId,
    })

    console.log("walletTransactionHistory : ",walletTransactionHistory)
  }
}
