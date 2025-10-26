import { TSubscription } from "../../../enums/subscription";
import { UserSubscriptionStatusType } from "../../subscription.module/userSubscription/userSubscription.constant";
import { UserSubscription } from "../../subscription.module/userSubscription/userSubscription.model";
import { IUser } from "../../user/user.interface";
import { User } from "../../user/user.model";

// 7. HANDLE SUBSCRIPTION CANCELLATION WEBHOOK
export const handleSubscriptionCancellation = async (subscription) => {
  console.log("🔥handleSubscriptionCancellation🔥 in webhook 🪝 ------", subscription);
  try {
    const user:IUser = await User.findOne({ 
      stripe_subscription_id: subscription.id 
    });
    
    if (!user) return;
    
    // Update user status to cancelled
    await User.findByIdAndUpdate(user._id, {
      subscriptionType: TSubscription.none,
      stripe_subscription_id: null
    });

  
    const updateMany = await UserSubscription.updateMany(
      { 
        userId: user._id,
        status : UserSubscriptionStatusType.active 
      },
      {
        $set: { 
          // expirationDate: new Date(),
          cancelledAt: new Date(),
          status: UserSubscriptionStatusType.cancelled,
        } 
      }
    );
    
    console.log(`🔚 Subscription cancelled for user: ${user.email}`);
    
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}
