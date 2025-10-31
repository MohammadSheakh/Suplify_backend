
//@ts-ignore
import Stripe from "stripe";
import { User } from "../../user/user.model";
//@ts-ignore
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

export const handleTrialWillEnd = async (subscription: Stripe.Subscription) => {
  // parameter name can be subscription
  try {
    /******
     * 
     * as we set metadata under subscription data ..
     * so first we have to get subscription from invoice.subscription
     * then we can get metadata from subscription object
     * 
     * *** */

    console.log("🧩 handleTrialWillEnd :: subscription.id -->", subscription.id);

    // ✅ Metadata stored when you created the subscription
    const metadata: IMetadataForFreeTrial = subscription.metadata;

    // ✅ Extract subscription details
    const invoiceInfo = {
      customer: subscription.customer,
      price_id: subscription.items.data[0]?.price.id,
      period_start: subscription.current_period_start,
      period_end: subscription.current_period_end,
      amount: subscription.items.data[0]?.price.unit_amount ?? metadata.amount,
      subscriptionId: subscription.id,
      subscription_metadata: {
        userId: metadata.userId,
        subscriptionType: metadata.subscriptionType,
        referenceId: metadata.referenceId,
        referenceFor: metadata.referenceFor,
        currency: metadata.currency,
        amount: metadata.amount,
      }
    };

    // console.log("---- handleTrialWillEnd :: invoiceInfo ----");
    // console.log(invoiceInfo);

    // ✅ Find user by Stripe customer ID
    const user = await User.findOne({
      stripe_customer_id: subscription.customer
    });

    if (!user) {
      console.error('❌ User not found for customer:', subscription.customer);
      return;
    }

    // ✅ Notify user or schedule reminder
    console.log(`Trial will end soon for user: ${user._id} (subscription ${subscription.id})`);
    
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

  } catch (error) {
    console.error('handleTrialWillEnd -> Error handling trial will end:', error);
    throw error;
  }
};