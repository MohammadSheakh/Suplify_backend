// 5. HANDLE FAILED PAYMENT
// async function handleFailedPayment(invoice) {
export const handleFailedPayment = async (invoice) => {
  /******
   * invoice.payment_failed → Payment failure

    Stripe gives you:

    invoice.subscription

    invoice.customer

    invoice.next_payment_attempt

    invoice.attempt_count

    👉 Update UserSubscription in DB:

    👉 status = "past_due" or "unpaid"
   * 
   * **** */
  try {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    const user = await User.findOne({ 
      stripe_customer_id: subscription.customer 
    });
    
    if (!user) return;
    
    // If trial ended and payment failed - downgrade user
    if (user.subscriptionStatus === 'trial') {
      await User.findByIdAndUpdate(user._id, {
        subscriptionStatus: 'none',
        isSubscriptionActive: false,
        
        // Clear trial fields
        freeTrialStartDate: null,
        freeTrialEndDate: null,
        freeTrialPlanType: null
      });
      
      console.log(`❌ User ${user.email} trial ended with failed payment - downgraded to free`);
      
      // Send payment failed email
      await sendPaymentFailedEmail(user);
    }
    
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}