import stripe from "../../../config/stripe.config";
import ApiError from "../../../errors/ApiError";
import { TRole } from "../../../middlewares/roles";
import { enqueueWebNotification } from "../../../services/notification.service";
import { TNotificationType } from "../../notification/notification.constants";
import { UserSubscriptionStatusType } from "../../subscription.module/userSubscription/userSubscription.constant";
import { IUserSubscription } from "../../subscription.module/userSubscription/userSubscription.interface";
import { UserSubscription } from "../../subscription.module/userSubscription/userSubscription.model";
import { TUser } from "../../user/user.interface";
import { User } from "../../user/user.model";
import { TPaymentGateway, TPaymentStatus } from "../paymentTransaction/paymentTransaction.constant";
import { PaymentTransaction } from "../paymentTransaction/paymentTransaction.model";
import { FailedWebhook } from "./failedWebhook.model";
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
//@ts-ignore
import Stripe from "stripe";

//------------------------------------------
// handle the USER SUBSCRIPTION RELATED PAYMENTS
//------------------------------------------
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

export const handleSuccessfulPayment = async (invoice: Stripe.Invoice) => {
  
  try {
    // if (invoice.billing_reason !== 'subscription_cycle') {
    //   return; // Only handle recurring subscription payments
    // }

    // Handle both subscription creation and recurring payments
    const validBillingReasons = ['subscription_create', 'subscription_cycle', 'subscription_update'];
    
    if (!validBillingReasons.includes(invoice.billing_reason)) {
      // console.log(`Skipping invoice with billing_reason: ${invoice.billing_reason}`);
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
     * Stripe webhooks don't expand nested objects by default,
     * so we need to get subscription ID from invoice lines
     *
     * *** */

    // ✅ FIX: Get subscription ID from multiple sources
    let subscriptionId = invoice.subscription as string | undefined;
    
    // If not on invoice, try to get from invoice lines (line items have subscription ID)
    if (!subscriptionId && invoice.lines?.data?.[0]) {
      subscriptionId = (invoice.lines.data[0] as any).subscription as string | undefined;
    }

    // If still not found, find UserSubscription by Stripe customer ID (stored by checkout.session.completed)
    if (!subscriptionId) {
      const user = await User.findOne({ stripe_customer_id: invoice.customer });
      if (user) {
        const userSub = await UserSubscription.findOne({ userId: user._id, stripe_subscription_id: { $ne: null } }).sort({ createdAt: -1 });
        if (userSub?.stripe_subscription_id) {
          subscriptionId = userSub.stripe_subscription_id;
          console.log('✅ Found subscription ID from UserSubscription by customer:', subscriptionId);
        }
      }
    }

    // Validate subscription ID before retrieving
    if (!subscriptionId || typeof subscriptionId !== 'string') {
      console.error('❌ Invalid or missing subscription ID in invoice:', invoice.id, 'customer:', invoice.customer, 'subscription:', invoice.subscription, 'lines:', invoice.lines?.data?.[0]?.subscription);
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'pending_setup_intent']
    });

    // ✅ Access metadata from subscription (set in subscription_data.metadata during checkout)
    const metadata:IMetadataForFreeTrial = subscription.metadata;

    // ✅ If metadata.referenceId is missing, try getting from UserSubscription
    if (!metadata?.referenceId) {
      console.log('⚠️ Missing metadata in subscription, trying to find UserSubscription by stripe_subscription_id...');
      const userSub = await UserSubscription.findOne({ stripe_subscription_id: subscriptionId });
      if (userSub) {
        // Populate metadata from UserSubscription
        (metadata as any).referenceId = userSub._id.toString();
        (metadata as any).userId = userSub.userId.toString();
        (metadata as any).referenceFor = TTransactionFor.UserSubscription;
        (metadata as any).subscriptionType = userSub.status;
        console.log('✅ Found UserSubscription by stripe_subscription_id:', userSub._id);
      } else {
        console.error('❌ No UserSubscription found for subscription ID:', subscriptionId);
        return;
      }
    }

    // console.log("Subscription :: 🔊🔊🔊🔊🔊🔊🔊", subscription.latest_invoice.period_start)
    // console.log("Subscription :: 🔊🔊🔊🔊🔊🔊🔊", new Date(subscription.latest_invoice.period_start * 1000))
    // console.log("Subscription :: 🔊🔊🔊🔊🔊🔊🔊", subscription.latest_invoice.period_end)
    // console.log("Subscription :: 🔊🔊🔊🔊🔊🔊🔊", new Date(subscription.latest_invoice.period_end * 1000))

/*

  Subscription :: 🔊🔊🔊🔊🔊🔊🔊 {
    id: 'sub_1SNWKdRw9NX4Ne6pPRlYZ5vg',
    object: 'subscription',
    
    cancel_at: null,
    cancel_at_period_end: false,
    canceled_at: null,
   
    created: 1761732618,
   
    latest_invoice: {
      id: 'in_1SNWelRw9NX4Ne6p8VoFZLUd',
     
      created: 1767003018,
      
      period_end: 1767003018,
      period_start: 1764411018,
    
    },
    
  }
*/

    // ✅ Use metadata from subscription (already declared above)
    const invoiceInfo = {
      customer : invoice.customer,
      payment_intent : invoice.payment_intent,
      price_id : invoice.lines?.data?.[0]?.price?.id || null,
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

    // console.log("---- invoice.billing_reason handleSuccessfulPayment for  Subscription Related :: ", invoice.billing_reason ) 
    // console.log("---- invoiceInfo from handleSuccessfulPayment for  Subscription Related :: ", invoiceInfo ) 

    // Find user by Stripe customer ID
    const user:TUser = await User.findOne({ 
      stripe_customer_id: subscription.customer 
    });

    if (!user){
      console.error('User not found for customer:', subscription.customer);
      return;
    }

    // ✅ Robust paymentIntent and transactionId resolution
    let resolvedPaymentIntent = invoice.payment_intent as string | undefined;

    // Try expanded latest_invoice from retrieved subscription
    if (!resolvedPaymentIntent && subscription.latest_invoice) {
      const latestInv = subscription.latest_invoice as Stripe.Invoice;
      if (typeof latestInv.payment_intent === 'string') {
        resolvedPaymentIntent = latestInv.payment_intent;
      } else if (latestInv.payment_intent && typeof latestInv.payment_intent === 'object') {
        resolvedPaymentIntent = (latestInv.payment_intent as any).id;
      }
    }

    // Try UserSubscription record if still not found
    if (!resolvedPaymentIntent) {
      const userSub = await UserSubscription.findById(metadata.referenceId);
      if (userSub?.stripe_transaction_id) {
        resolvedPaymentIntent = userSub.stripe_transaction_id;
        console.log('✅ Found paymentIntent from UserSubscription:', resolvedPaymentIntent);
      }
    }

    const finalTransactionId = (invoice.charge as string) || (invoice.id as string);
    const finalAmount = Number(invoiceInfo.subscription_metadata.amount) || (invoice.amount_paid / 100);
   
    // ✅ Use proper Stripe dates instead of manual calculation
    // const dates = calculateSubscriptionDates(subscription, invoice);
   
    
    /*──────────────────────────────────
    |  FIRST PAYMENT (subscription_create)
    └────────────────────────────────────*/
    if(invoice.billing_reason === 'subscription_create'){
      console.log("⚡ Processing first payment (subscription_create)", {
        userId: metadata.userId,
        referenceId: metadata.referenceId,
        subscriptionId,
        paymentIntent: resolvedPaymentIntent
      });

      // Idempotency check: verify if this payment was already processed
      const duplicateQuery: any[] = [];
      if (resolvedPaymentIntent) duplicateQuery.push({ paymentIntent: resolvedPaymentIntent });
      if (finalTransactionId) duplicateQuery.push({ transactionId: finalTransactionId });

      let existingPayment = null;
      if (duplicateQuery.length > 0) {
        existingPayment = await PaymentTransaction.findOne({ $or: duplicateQuery });
      }

      if (existingPayment) {
        console.log('⏭️ PaymentTransaction already exists for this payment:', { 
          paymentIntent: resolvedPaymentIntent, 
          transactionId: finalTransactionId 
        });
        // Still proceed to update UserSubscription in case it's not active
      } else {
        // Create PaymentTransaction
        const newPayment = await PaymentTransaction.create({
          userId: user._id,
          referenceFor: invoiceInfo.subscription_metadata.referenceFor,
          referenceId: invoiceInfo.subscription_metadata.referenceId,
          paymentGateway: TPaymentGateway.stripe,
          transactionId: finalTransactionId,
          paymentIntent: resolvedPaymentIntent,
          amount: finalAmount,
          currency: invoiceInfo.subscription_metadata.currency,
          paymentStatus: TPaymentStatus.completed,
          gatewayResponse: invoiceInfo,
        });

        console.log('✅ PaymentTransaction created:', newPayment._id);

        await enqueueWebNotification(
          `New Subscription purchased by ${user._id} ${user.name} and paid ${invoiceInfo.subscription_metadata.amount} ${invoiceInfo.subscription_metadata.currency}`,
          user._id,
          null,
          TRole.admin,
          TNotificationType.payment,
          null,
          null
        );
      }

      // ✅ FIX: Always add 1 month from periodStart for expiration
      const periodStart = subscription.latest_invoice?.period_start;
      const periodEnd = subscription.latest_invoice?.period_end;

      const subscriptionStartDate = periodStart ? new Date(periodStart * 1000) : new Date();
      const currentPeriodStartDate = periodStart ? new Date(periodStart * 1000) : new Date();
      
      let expirationDate: Date;
      if (periodEnd && periodEnd > periodStart) {
        expirationDate = new Date(periodEnd * 1000);
      } else {
        expirationDate = new Date(subscriptionStartDate);
        expirationDate.setMonth(expirationDate.getMonth() + 1);
      }

      // Validate dates
      if (isNaN(subscriptionStartDate.getTime()) || isNaN(currentPeriodStartDate.getTime()) || isNaN(expirationDate.getTime())) {
        console.error('❌ Invalid date calculation for subscription_create, using fallback');
        const now = new Date();
        const future30 = new Date();
        future30.setMonth(future30.getMonth() + 1);
        subscriptionStartDate.setTime(now.getTime());
        currentPeriodStartDate.setTime(now.getTime());
        expirationDate.setTime(future30.getTime());
      }

      console.log('📅 Calculated dates:', { subscriptionStartDate, currentPeriodStartDate, expirationDate });

      // Update UserSubscription with Stripe IDs and dates
      await UserSubscription.findByIdAndUpdate(metadata.referenceId, {
        $set: {
          stripe_subscription_id: subscriptionId,
          stripe_transaction_id: resolvedPaymentIntent,
          subscriptionPlanId: metadata.subscriptionPlanId,
          status: UserSubscriptionStatusType.active,
          subscriptionStartDate,
          currentPeriodStartDate,
          expirationDate,
          renewalDate: expirationDate,
          billingCycle: 1,
          isAutoRenewed: true,
          cancelledAtPeriodEnd: false,
        }
      });

      // Update user's subscriptionType and mark free trial as used
      await User.findByIdAndUpdate(metadata.userId, {
        $set: {
          subscriptionType: metadata.subscriptionType,
          hasUsedFreeTrial: true,
        }
      });

      console.log('✅ UserSubscription activated and user updated:', {
        userId: metadata.userId,
        userSubscriptionId: metadata.referenceId,
        subscriptionType: metadata.subscriptionType
      });

    /*──────────────────────────────────
    | RECURRING PAYMENT (subscription_cycle)
    └────────────────────────────────────*/
    }else if(invoice.billing_reason === 'subscription_cycle'){
      console.log("🔁 Processing recurring payment (subscription_cycle)", {
        userId: metadata.userId,
        referenceId: metadata.referenceId,
        subscriptionId
      });
      /*
        {
          customer: 'cus_SzzhhEPsNynY9B',
          payment_intent: 'pi_3SEvpURw9NX4Ne6p19BCN1jV',
          price_id: 'price_1S3YyYRw9NX4Ne6puniNEZQp',
          period_start: 1757089863,
          period_end: 1759681863,
          amount_paid: 35000,
          billing_reason: 'subscription_cycle',
          subscriptionId: 'sub_1S42XVRw9NX4Ne6peXI84QDf',
          subscription_metadata: {
            userId: '68b951f71859ecfc7332ea8f',
            subscriptionType: 'standard',
            referenceId: '68bb1033e6d83d6270549703',
            referenceFor: 'UserSubscription',
            currency: 'usd',
            amount: '350'
          }
        }
      */

      // TODO : MUST : payment_intent er upor base kore decision nite hobe 
      // MAYBE >>>>>>>>>>>>>>>>>>>> amra database update korbo ki korbo na  

      // Get current billing cycle
      const userSubscription = await UserSubscription.findById(metadata.referenceId);
      if (!userSubscription) {
        throw new Error(`UserSubscription not found: ${metadata.referenceId}`);
      }

      // lets check if any transaction found for this payment_intent or transactionId
      const duplicateQuery: any[] = [];
      if (resolvedPaymentIntent) duplicateQuery.push({ paymentIntent: resolvedPaymentIntent });
      if (finalTransactionId) duplicateQuery.push({ transactionId: finalTransactionId });

      let existingPayment = null;
      if (duplicateQuery.length > 0) {
        existingPayment = await PaymentTransaction.findOne({ $or: duplicateQuery });
      }

      if (existingPayment) 
      {
        console.log('⏭️ Recurring payment already processed:', { 
          paymentIntent: resolvedPaymentIntent, 
          transactionId: finalTransactionId 
        });
        return;
      }

      // const { current_period_start, current_period_end } = subscription;

      const newPayment = await PaymentTransaction.create({
        userId: invoiceInfo.subscription_metadata.userId,
        referenceFor : invoiceInfo.subscription_metadata.referenceFor, // If this is for Order .. we pass "Order" here
        referenceId :  invoiceInfo.subscription_metadata.referenceId, // If this is for Order .. then we pass OrderId here
        paymentGateway: TPaymentGateway.stripe,
        transactionId:  finalTransactionId,
        paymentIntent: resolvedPaymentIntent,
        amount: finalAmount,
        currency : invoiceInfo.subscription_metadata.currency,
        paymentStatus: TPaymentStatus.completed,
        gatewayResponse: invoiceInfo,
      });

      // console.log("newPayment ->>", newPayment)

      await enqueueWebNotification(
          `Recurring Subscription payment received from ${user._id} ${user.name} and paid ${invoiceInfo.subscription_metadata.amount} ${invoiceInfo.subscription_metadata.currency} successfully.`,
          user._id, // senderId
          null, // receiverId
          TRole.admin, // receiverRole
          TNotificationType.payment, // type
          null, // linkFor
          null // linkId
      );

      const userSub:IUserSubscription = await UserSubscription.findById(metadata.referenceId);

      // ✅ FIX: Safe date calculation for recurring payments
      const periodStart = subscription.latest_invoice?.period_start;
      const periodEnd = subscription.latest_invoice?.period_end;
      
      // Use existing expiration date as base, or fallback to Stripe dates, or current date + 30
      let baseDate = userSub.expirationDate;
      if (!baseDate || isNaN(new Date(baseDate).getTime())) {
        baseDate = periodStart ? new Date(periodStart * 1000) : new Date();
      }
      
      const newExpirationDate = new Date(baseDate);
      newExpirationDate.setDate(newExpirationDate.getDate() + 30); // ✅ adds 30 days

      // Validate the new expiration date
      if (isNaN(newExpirationDate.getTime())) {
        console.error('❌ Invalid expiration date calculation for subscription_cycle, using fallback');
        newExpirationDate.setTime(new Date().getTime());
        newExpirationDate.setDate(newExpirationDate.getDate() + 30);
      }

      // TODO : referenceFor theke Model ta select korte hobe Best practice
      // 1. Update UserSubscription with Stripe IDs
      await UserSubscription.findByIdAndUpdate(metadata.referenceId, {
        $set: {
          stripe_subscription_id: subscriptionId,
          stripe_transaction_id: resolvedPaymentIntent,
          subscriptionPlanId: metadata.subscriptionPlanId,
          status: UserSubscriptionStatusType.active,
          currentPeriodStartDate: userSub.expirationDate || new Date(),
          expirationDate: newExpirationDate,
          renewalDate: newExpirationDate,
          billingCycle: (userSub.billingCycle || 0) + 1, // ✅ INCREMENT
          isAutoRenewed : true,
        }
      });

      // console.log("Updated updatedUserSub ->>", updatedUserSub) 


      // 2. Mark user as having used free trial (option 2: after first payment)
      await User.findByIdAndUpdate(metadata.userId, {
        $set: { 
          hasUsedFreeTrial: true,
          subscriptionType: metadata.subscriptionType 
          }
      });

    /*──────────────────────────────────
    | SUBSCRIPTION UPDATE (plan change, proration) | we need to work on this   
    └────────────────────────────────────*/
    }else if(invoice.billing_reason === 'subscription_update'){
      
      // console.log("⚡ This is subscription update payment (plan change, proration, etc.)");
      // Create payment transaction
      await PaymentTransaction.create({
        userId: metadata.userId,
        referenceFor: metadata.referenceFor,
        referenceId: metadata.referenceId,
        paymentGateway: TPaymentGateway.stripe,
        transactionId: finalTransactionId,
        paymentIntent: resolvedPaymentIntent,
        amount: finalAmount,
        currency: invoice.currency,
        paymentStatus: TPaymentStatus.completed,
        gatewayResponse: invoice,
      });

      // Update subscription
      await UserSubscription.findByIdAndUpdate(metadata.referenceId, {
        $set: {
          currentPeriodStartDate: new Date(subscription.current_period_start * 1000),
          expirationDate: new Date(subscription.current_period_end * 1000),
          renewalDate: new Date(subscription.current_period_end * 1000),
          stripe_transaction_id: resolvedPaymentIntent,
        }
      });
    
    
    }else if(invoice.billing_reason === 'trial_end'){
        // console.log("⚠️ This is trial end - usually triggers subscription_create invoice");

        await enqueueWebNotification(
          `Trial ended for user ${user._id} ${user.name}.`,
          null, // senderId  as system notification
          user._id, // receiverId
          TRole.patient, // receiverRole
          TNotificationType.system, // type
          null, // linkFor
          null // linkId
      );

    }else {
        // console.log("⚡ Other billing reason: ", invoice.billing_reason);
    }

    
    return true;
  } catch (error) {
    console.error('⛔ Error handling successful payment:', error);

    // 5. Log for retry
    // await FailedWebhook.create({
    //   eventId: invoice.id,
    //   invoiceId: invoice.id,
    //   subscriptionId,
    //   metadata,
    //   error: error.message,
    //   stage: 'unknown',
    //   attemptCount: 1
    // });

    // 6. Alert (optional)
    // await sendCriticalAlert(err, invoice, metadata);

    // 7. Re-throw to trigger Stripe retry (optional)
    // throw err; // only if you want Stripe to retry
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


// ✅ Safe date helper
// const safeDate = (timestamp?: number) => 
//   (timestamp ? new Date(timestamp * 1000) : null);

// // ✅ Robust date calculator

// const calculateSubscriptionDates = (subscription, invoice) => {
//   const trialEnd   = safeDate(subscription.trial_end);
//   const subStart   = safeDate(subscription.start_date);

//   const currentPeriodStart = safeDate(invoice.period_start) || safeDate(subscription.current_period_start);
//   const currentPeriodEnd   = safeDate(invoice.period_end)   || safeDate(subscription.current_period_end);

//   return {
//     subscriptionStartDate: subStart,                // first ever subscription date
//     currentPeriodStartDate: currentPeriodStart,     // beginning of this billing cycle
//     expirationDate: trialEnd || currentPeriodEnd,   // trial end OR billing cycle end
//     renewalDate: trialEnd || currentPeriodEnd,      // trial end OR billing cycle end
//     isInTrial: !!trialEnd && trialEnd > new Date()
//   };
// };