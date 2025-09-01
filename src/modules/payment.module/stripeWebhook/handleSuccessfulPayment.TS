export const handleSuccessfulPayment = async (invoice) => {
  try {
    if (invoice.billing_reason !== 'subscription_cycle') {
      return; // Only handle recurring subscription payments
    }
    
    const subscriptionId = invoice.subscription;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Find user by Stripe customer ID
    const user = await User.findOne({ 
      stripe_customer_id: subscription.customer 
    });
    
    if (!user) {
      console.error('User not found for customer:', subscription.customer);
      return;
    }
    
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
    
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}
