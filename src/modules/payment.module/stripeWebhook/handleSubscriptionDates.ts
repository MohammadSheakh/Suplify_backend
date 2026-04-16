import { UserSubscription } from "../../subscription.module/userSubscription/userSubscription.model";
import { User } from "../../user/user.model";

export interface IMetadataForFreeTrial{
    userId: string;
    subscriptionType: string;
    subscriptionPlanId?: string; // ⚡ we will add this in webhook for standard plan after free trial end
    referenceId: string; // this is userSubscription._id
    referenceFor: string; // TTransactionFor.UserSubscription
    currency: string;
    amount: string;
}

export const handleSubscriptionDates = async (subscription) => {
  console.log("2️⃣ ℹ️");
  try {
    // console.log("🟢 Subscription from handleSubscriptionDates to update 🟢", subscription);

    const metadata = subscription.metadata || {};
    const userId = metadata.userId;
    const referenceId = metadata.referenceId; // UserSubscription._id

    if (!userId || !referenceId) {
      console.error("❌ Missing userId or referenceId in subscription metadata");
      return false;
    }

    // ✅ FIX: Safe date conversion with validation
    const currentPeriodStart = subscription.current_period_start 
      ? new Date(subscription.current_period_start * 1000)
      : new Date();
      
    const currentPeriodEnd = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000)
      : (() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; })();

    const subscriptionStartDate = subscription.start_date 
      ? new Date(subscription.start_date * 1000)
      : new Date();

    // Validate all dates
    if (isNaN(currentPeriodStart.getTime()) || isNaN(currentPeriodEnd.getTime()) || isNaN(subscriptionStartDate.getTime())) {
      console.error('❌ Invalid dates in handleSubscriptionDates:', {
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        start_date: subscription.start_date,
        currentPeriodStart,
        currentPeriodEnd,
        subscriptionStartDate
      });
      return false;
    }

    // Determine if this is a NEW subscription or a RENEWAL
    const existingSubscription = await UserSubscription.findById(referenceId);

    let billingCycle = 1;
    if (existingSubscription && existingSubscription.billingCycle) {
      billingCycle = existingSubscription.billingCycle + 1;
    }

    // 1. Update UserSubscription
    const updateData = {
      $set: {
        stripe_subscription_id: subscription.id, // ✅ Store ID immediately so other webhooks can find it
        currentPeriodStartDate: currentPeriodStart,
        expirationDate: currentPeriodEnd, // <-- ✅ This is your key field!
        renewalDate: currentPeriodEnd,    // <-- ✅ Same as expiration for auto-renewal
        billingCycle,
      }
    };

    await UserSubscription.findByIdAndUpdate(referenceId, updateData, { new: true });

    console.log(`✅ UserSubscription ${referenceId} updated with renewal date: ${currentPeriodEnd.toISOString()} and subscriptionId: ${subscription.id}`);

    // 2. Mark user as having used free trial (if this is first paid cycle)
    if (billingCycle === 1) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          hasUsedFreeTrial: true,
          subscriptionType: metadata.subscriptionType,
          stripe_customer_id: subscription.customer, // ensure consistency
        }
      });
      console.log(`✅ User ${userId} marked as having used free trial and linked to customer: ${subscription.customer}`);
    }

    return true;
  } catch (error) {
    console.error('⛔ Error handling successful payment:', error);
  }
}


/******
    // 🎯 CONVERT FROM TRIAL TO PAID SUBSCRIPTION
    if (user.subscriptionStatus === 'trial') {
      const subscriptionStartDate = new Date();
      const subscriptionEndDate = new Date();
      
      // Calculate end date based on billing interval
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      
      if (price.recurring.interval === 'year') {
        subscriptionEndDate.setFullYear(subscriptionStartDate.getFullYear() + 1);
      } else {
        subscriptionEndDate.setMonth(subscriptionStartDate.getMonth() + 1);
      }
      
      // Update user to paid subscription
      await User.findByIdAndUpdate(user._id, {
        subscriptionStatus: getPlanTypeFromStripePrice(priceId),
        subscriptionStartDate: subscriptionStartDate,
        subscriptionEndDate: subscriptionEndDate,
        isSubscriptionActive: true,
        
        // Clear trial fields
        freeTrialStartDate: null,
        freeTrialEndDate: null,
        freeTrialPlanType: null
      });
      
      console.log(`✅ User ${user.email} automatically upgraded to paid subscription ($${price.unit_amount/100})`);
      
      // Send upgrade confirmation email
      await sendSubscriptionUpgradeEmail(user);
    }

    ****** */

    /****** Chat GPT Idea .. Must to Implement this 
     * 
     * {
        userId: user._id,                                  // from metadata or customer lookup
        subscriptionPlanId: dbPlan._id,                    // lookup via stripe_price_id
        subscriptionStartDate: invoice.period_start,       // billing cycle start
        currentPeriodStartDate: invoice.period_start,
        expirationDate: invoice.period_end,                // this period ends here
        renewalDate: invoice.period_end,                   // next billing date
        billingCycle: 1,
        isAutoRenewed: true,
        status: "active",                                  // since payment succeeded
        stripe_subscription_id: invoice.subscription,
        stripe_transaction_id: invoice.payment_intent,
      }
     * 
     * ***** */