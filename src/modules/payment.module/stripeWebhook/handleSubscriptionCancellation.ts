import { TSubscription } from "../../../enums/subscription";
import { UserSubscriptionStatusType } from "../../subscription.module/userSubscription/userSubscription.constant";
import { UserSubscription } from "../../subscription.module/userSubscription/userSubscription.model";
import { IUser } from "../../user/user.interface";
import { User } from "../../user/user.model";

// 7. HANDLE SUBSCRIPTION CANCELLATION WEBHOOK
export const handleSubscriptionCancellation = async (subscription) => {
  console.log("🔥handleSubscriptionCancellation🔥 in webhook 🪝 ------", subscription);
  /*-----------------------------------------
  data available in subscription object  .. we remove some data from this response which we think unnecessary 
  {
    id: 'sub_1SNSzsRw9NX4Ne6psIqI3Be3',
    object: 'subscription',
    
    canceled_at: 1761720144,
    cancellation_details: { comment: null, feedback: null, reason: 'cancellation_requested' },
    
    created: 1761719798,
    currency: 'usd',
    current_period_end: 1764398198,
    current_period_start: 1761719798,
    customer: 'cus_TJ2Xbq2SCFyEOQ',
    
    ended_at: 1761720144,
    
    metadata: {
      referenceId: '6901b5e4dd11d78cdfd0ae60',
      userId: '68eb3d9022033846c3cb22ed',
      currency: 'usd',
      referenceFor: 'UserSubscription',
      subscriptionPlanId: '68e33abe25e9e6dc25844441',
      subscriptionType: 'standard',
      amount: '70'
    },
    plan: {
      id: 'price_1SF5K9Rw9NX4Ne6p7ZB874cW',
      object: 'plan',
      active: true,
      created: 1759722177,
      product: 'prod_TBSE6LiTHYBgxe',
    },
    start_date: 1761719798,
    status: 'canceled',
    test_clock: null,
    transfer_data: null,
    trial_end: null,
    trial_settings: { end_behavior: { missing_payment_method: 'create_invoice' } },
    trial_start: null
  }
  ------------------------------------------* */
  try {
    const user:IUser = await User.findById( 
       subscription.metadata.userId 
    );
    
    if (!user) return;

    if(user.subscriptionType === TSubscription.none) return;
    
    // Update user status to cancelled
    await User.findByIdAndUpdate(user._id, {
      subscriptionType: TSubscription.none,
      stripe_subscription_id: null
    });

  
    await UserSubscription.updateMany(
      { 
        userId: user._id,
        status : UserSubscriptionStatusType.active 
      },
      {
        $set: { 
          // expirationDate: new Date(),
          cancelledAt: new Date(),
          status: UserSubscriptionStatusType.cancelled,
          isAutoRenewed : false,
        } 
      }
    );
    
    console.log(`🔚 Subscription cancelled for user: ${user.email}`);
    
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}
