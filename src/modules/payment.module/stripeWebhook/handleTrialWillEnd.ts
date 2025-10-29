
//@ts-ignore
import Stripe from "stripe";
import ApiError from "../../../errors/ApiError";
import { IUser } from "../../token/token.interface";
import { User } from "../../user/user.model";
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import stripe from "../../../config/stripe.config";
import { TUser } from "../../user/user.interface";
import { enqueueWebNotification } from "../../../services/notification.service";
import { TRole } from "../../../middlewares/roles";
import { TNotificationType } from "../../notification/notification.constants";

export interface IMetadataForFreeTrial{
    userId: string;
    subscriptionType: string;
    subscriptionPlanId?: string; // ⚡ we will add this in webhook for standard plan after free trial end
    referenceId: string; // this is userSubscription._id
    referenceFor: string; // TTransactionFor.UserSubscription
    currency: string;
    amount: string;
}

export const handleTrialWillEnd = async (invoice: Stripe.Subscription) => {
  // parameter name can be subscription
  try {
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

    console.log("---- invoice.billing_reason handleSuccessfulPayment for  Subscription Related :: ", invoice.billing_reason ) 
    console.log("---- invoiceInfo from handleSuccessfulPayment for  Subscription Related :: ", invoiceInfo ) 

    /*----------------------------------------
    ---------------------------------------** */
    // Find user by Stripe customer ID
    const user:TUser = await User.findOne({ 
      stripe_customer_id: subscription.customer 
    });

    if (!user) {
      console.error('User not found for customer:', subscription.customer);
      return;
    }
    
    // TODO: Send notification email
    // await sendTrialEndingEmail(metadata.userId, subscription.trial_end);

    await enqueueWebNotification(
        `Dear ${user.name}, Your trial for ${metadata.subscriptionType} will end soon. at ${invoiceInfo.period_end}`, // TODO : MUST :: ei period_end ta check korte hobe 
        null, // senderId
        user._id, // receiverId
        TRole.patient, // receiverRole
        TNotificationType.system, // type // INFO : i think this is not actual type .. need to fix this type
        // '', // linkFor
        // existingTrainingProgram._id // linkId
        // TTransactionFor.TrainingProgramPurchase, // referenceFor
        // purchaseTrainingProgram._id // referenceId
    );

    console.log(`Trial ending soon for subscription: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling trial will end:', error);
    throw error;
  }
};