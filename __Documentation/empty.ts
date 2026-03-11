export const handleSuccessfulPayment = async (invoice: Stripe.Subscription) => {
  
  try {
    const validBillingReasons = ['subscription_create', 'subscription_cycle', 'subscription_update'];
    
    if (!validBillingReasons.includes(invoice.billing_reason)) {
      // console.log(`Skipping invoice with billing_reason: ${invoice.billing_reason}`);
      return;
    }
    const subscriptionId = invoice.subscription;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'pending_setup_intent']
    });

    // ✅ Access metadata from subscription, not invoice
    const metadata:IMetadataForFreeTrial = subscription.metadata;
 
    const invoiceInfo = {
      customer : invoice.customer,
      payment_intent : invoice.payment_intent,
      price_id : invoice.lines.data[0].price.id,
      period_start : invoice.period_start,
      period_end : invoice.period_end,
      amount_paid : invoice.amount_paid,
      billing_reason : invoice.billing_reason,
      subscriptionId : invoice.subscription,
      subscription_metadata :  {
        userId: metadata.userId,
        subscriptionType: metadata.subscriptionType,
        referenceId : metadata.referenceId,
        referenceFor: metadata.referenceFor,
        currency: metadata.currency,
        amount: metadata.amount
      }
    }

    // Find user by Stripe customer ID
    const user:TUser = await User.findOne({ 
      stripe_customer_id: subscription.customer 
    });

    if (!user){
      console.error('User not found for customer:', subscription.customer);
      return;
    }
    /*──────────────────────────────────
    |  FIRST PAYMENT (subscription_create)   
    └────────────────────────────────────*/
    if(invoice.billing_reason === 'subscription_create'){
      
      const existingPayment = await PaymentTransaction.findOne({
        paymentIntent: invoice.payment_intent
      });
      if (existingPayment)
      {
        return;
      }

      const newPayment = await PaymentTransaction.create({
        userId: user._id,
        referenceFor : invoiceInfo.subscription_metadata.referenceFor, // If this is for Order .. we pass "Order" here
        referenceId :  invoiceInfo.subscription_metadata.referenceId, // If this is for Order .. then we pass OrderId here
        paymentGateway: TPaymentGateway.stripe,
        transactionId: invoice.charge || invoice.id, // ✅ Use charge ID // INFO : previously we set this null but it should be invoice.charge
        paymentIntent: invoiceInfo.payment_intent,
        amount: invoiceInfo.subscription_metadata.amount,
        currency : invoiceInfo.subscription_metadata.currency,
        paymentStatus: TPaymentStatus.completed,
        gatewayResponse: invoiceInfo,
      });


      await enqueueWebNotification(
          `New Subscription puchased by ${user._id} ${user.name} and paid ${invoiceInfo.subscription_metadata.amount} ${invoiceInfo.subscription_metadata.currency}`,
          user._id, // senderId
          null, // receiverId
          TRole.admin, // receiverRole
          TNotificationType.payment, // type
          null, // linkFor
          null // linkId
      );
      
      // console.log("newPayment created --- handleSuccessfulPayment --- invoice.billing_reason === 'subscription_create' =>> ", newPayment);

      const newExpirationDate = new Date();
      newExpirationDate.setDate(newExpirationDate.getDate() + 30); // ✅ adds 30 days

      // 1. Update UserSubscription with Stripe IDs
      const userSubs = await UserSubscription.findByIdAndUpdate(metadata.referenceId, {
        $set: {
          stripe_subscription_id: subscriptionId,
          stripe_transaction_id: invoice.payment_intent,
          subscriptionPlanId: metadata.subscriptionPlanId, // You'll need to fetch this
          status: UserSubscriptionStatusType.active,
          
          subscriptionStartDate :  new Date(subscription.latest_invoice.period_start * 1000),

          currentPeriodStartDate : new Date(subscription.latest_invoice.period_start * 1000),  
          
          expirationDate : newExpirationDate,
        
          renewalDate : newExpirationDate,
          billingCycle : 1 , // First billing cycle 
          isAutoRenewed : true,
          
        }
      });

      
    }

// ==============================>


export const handleSubscriptionDates = async (subscription) => {
  console.log("2️⃣ ℹ️");
  try {
    
    const metadata = subscription.metadata || {};
    const userId = metadata.userId;
    const referenceId = metadata.referenceId; // UserSubscription._id

    if (!userId || !referenceId) {
      console.error("❌ Missing userId or referenceId in subscription metadata");
      return false;
    }

    // Convert Stripe timestamps to JS Dates
    const currentPeriodStart = new Date(subscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000); // This is your RENEWAL / EXPIRATION DATE

    const subscriptionStartDate = new Date(subscription.start_date * 1000);

    const existingSubscription = await UserSubscription.findById(referenceId);

    let billingCycle = 1;
    if (existingSubscription && existingSubscription.billingCycle) {
      billingCycle = existingSubscription.billingCycle + 1;
    }

    // 1. Update UserSubscription
    const updateData = {
      $set: {
        currentPeriodStartDate: currentPeriodStart,
        expirationDate: currentPeriodEnd, // <-- ✅ This is your key field!
        renewalDate: currentPeriodEnd,    // <-- ✅ Same as expiration for auto-renewal
        billingCycle,
      }
    };

    await UserSubscription.findByIdAndUpdate(referenceId, updateData, { new: true });

    console.log(`✅ UserSubscription ${referenceId} updated with renewal date: ${currentPeriodEnd.toISOString()}`);

    // 2. Mark user as having used free trial (if this is first paid cycle)
    // Only mark if this is the first billing cycle (or if user hasn't been marked yet)
    if (billingCycle === 1) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          hasUsedFreeTrial: true,
          subscriptionType: metadata.subscriptionType,
          stripe_customer_id: subscription.customer, // ensure consistency
        }
      });
      console.log(`✅ User ${userId} marked as having used free trial`);
    }

    return true;
  } catch (error) {
    console.error('⛔ Error handling successful payment:', error);
  }
}