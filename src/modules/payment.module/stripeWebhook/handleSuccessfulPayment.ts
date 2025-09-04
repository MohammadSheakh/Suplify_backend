import stripe from "../../../config/stripe.config";
import { UserSubscriptionStatusType } from "../../subscription.module/userSubscription/userSubscription.constant";
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

/*****
 * 🔥🔥 event.type customer.subscription.trial_will_end
 * 
 * This event fires 3 days before the trial ends, giving you time to:

    Notify the user
    Handle potential payment failures
    Provide last-chance offers
 * 
 * ****** */

export const handleSuccessfulPayment = async (invoice) => {
  try {
    // if (invoice.billing_reason !== 'subscription_cycle') {
    //   return; // Only handle recurring subscription payments
    // }

    // Handle both subscription creation and recurring payments
    const validBillingReasons = ['subscription_create', 'subscription_cycle', 'subscription_update'];
    
    if (!validBillingReasons.includes(invoice.billing_reason)) {
      console.log(`Skipping invoice with billing_reason: ${invoice.billing_reason}`);
      return;
    }

/*

'subscription_create' -> First payment after trial ends (or immediate if no trial)
'subscription_cycle'  -> Regular recurring billing cycle
'subscription_update' -> Plan change, proration, etc.
'trial_end'           ->  ⚠️ Not used directly in invoice.paid , but trial ends trigger an invoice
                       with subscription_create

*/

    /******
     * 
     * as we set metadata under subscription data ..
     * so first we have to get subscription from invoice.subscription
     * then we can get metadata from subscription object
     * 
     * *** */

    const subscriptionId = invoice.subscription;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // ✅ Access metadata from subscription, not invoice
    const metadata:IMetadataForFreeTrial = subscription.metadata;
    
    console.log("⚡⚡⚡ subscription metadata :: ", {
        userId: metadata.userId,
        subscriptionType: metadata.subscriptionType,
        referenceId : metadata.referenceId,
        referenceFor: metadata.referenceFor,
        currency: metadata.currency,
        amount: metadata.amount
    });

    // Find user by Stripe customer ID
    const user = await User.findOne({ 
      stripe_customer_id: subscription.customer 
    });

    // console.log("⚡ User found -> stripe_customer_id :: ", user?.stripe_customer_id);
    // console.log("⚡ invoice -> stripe_customer_id:: ", invoice.customer);
    // console.log("⚡ invoice -> payment intent Id (transaction reference) :: ", invoice.payment_intent )
    // console.log("⚡ invoice -> price Id :: ", invoice.lines.data[0].price.id )
    // console.log("⚡ invoice -> period_start , period_end :: ", invoice.period_start , invoice.period_end )
    // console.log("⚡ invoice -> amount paid :: ", invoice.amount_paid )    
     console.log("⚡ invoice.billing_reason :: ", invoice.billing_reason)
    // console.log("⚡ invoice.subscription which is may be subscriptionId :: ",invoice.subscription); 

    if (!user) {
      console.error('User not found for customer:', subscription.customer);
      return;
    }

    if(invoice.billing_reason === 'subscription_create'){
        console.log("⚡ This is first payment after trial or immediate payment without trial");

        const { current_period_start, current_period_end } = subscription;

        const startDate = new Date(current_period_start * 1000);
        const endDate = new Date(current_period_end * 1000);

        // 1. Update UserSubscription with Stripe IDs
        await UserSubscription.findByIdAndUpdate(metadata.referenceId, {
          $set: {
            stripe_subscription_id: subscriptionId,
            stripe_transaction_id: invoice.payment_intent,
            subscriptionPlanId: metadata.subscriptionPlanId, // You'll need to fetch this
            status: UserSubscriptionStatusType.active,
            currentPeriodStartDate: new Date(subscription.start_date * 1000),
            expirationDate:  new Date(subscription.trial_end * 1000),
            // Add other fields as needed
          }
        });

        // 2. Mark user as having used free trial (option 2: after first payment)
        await User.findByIdAndUpdate(metadata.userId, {
          $set: { hasUsedFreeTrial: true }
        });


    }else if(invoice.billing_reason === 'subscription_cycle'){
        console.log("⚡ This is recurring subscription payment");
    }else if(invoice.billing_reason === 'subscription_update'){
        console.log("⚡ This is subscription update payment (plan change, proration, etc.)");
    }else if(invoice.billing_reason === 'trial_end'){
        console.log("⚠️ This is trial end - usually triggers subscription_create invoice");
    }else {
        console.log("⚡ Other billing reason:", invoice.billing_reason);
    }

    
    return true;
  } catch (error) {
    console.error('Error handling successful payment:', error);
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