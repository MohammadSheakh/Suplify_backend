import stripe from "../../../config/stripe.config";
import { User } from "../../user/user.model";

export const handleSuccessfulPayment = async (invoice) => {
  try {
    if (invoice.billing_reason !== 'subscription_cycle') {
      return; // Only handle recurring subscription payments
    }
    
    const subscriptionId = invoice.subscription;
    console.log("⚡ invoice.subscription :: ",invoice.subscription); 
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    console.log("⚡ invoice.subscription which is may be subscriptionId :: ",invoice.subscription); 

    // Find user by Stripe customer ID
    const user = await User.findOne({ 
      stripe_customer_id: subscription.customer 
    });

    console.log("⚡ User found -> stripe_customer_id :: ", user?.stripe_customer_id);

    console.log("⚡ invoice -> stripe_customer_id:: ", invoice.customer);

    if (!user) {
      console.error('User not found for customer:', subscription.customer);
      return;
    }

    console.log("⚡ invoice -> payment intent Id (transaction reference) :: ", invoice.payment_intent )
    
    console.log("⚡ invoice -> price Id :: ", invoice.lines.data[0].price.id )

    console.log("⚡ invoice -> period_start , period_end :: ", invoice.period_start , invoice.period_end )

    console.log("⚡ invoice -> amount paid :: ", invoice.amount_paid )
    
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
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}
