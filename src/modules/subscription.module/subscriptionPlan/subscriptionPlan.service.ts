//@ts-ignore
import Stripe from "stripe";
import { GenericService } from "../../_generic-module/generic.services";
import { ISubscriptionPlan } from "./subscriptionPlan.interface";
import { SubscriptionPlan } from "./subscriptionPlan.model";
import { UserSubscriptionService } from "../userSubscription/userSubscription.service";
import stripe from "../../../config/stripe.config";
import ApiError from "../../../errors/ApiError";
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { User } from "../../user/user.model";
import { TSubscription } from "../../../enums/subscription";
import { IUserSubscription } from "../userSubscription/userSubscription.interface";
import { UserSubscription } from "../userSubscription/userSubscription.model";
import { UserSubscriptionStatusType } from "../userSubscription/userSubscription.constant";
import { TTransactionFor } from "../../payment.module/paymentTransaction/paymentTransaction.constant";
import { TCurrency } from "../../../enums/payment";
import { config } from "../../../config";
import { IUser } from "../../token/token.interface";
import { TUser } from "../../user/user.interface";

export class SubscriptionPlanService extends GenericService<typeof SubscriptionPlan, ISubscriptionPlan>
{
    private stripe : Stripe
    
    constructor(){
        super(SubscriptionPlan)
        this.stripe = stripe;
    }

    userSubscriptionService = new UserSubscriptionService()

    getByTSubscription = async (subscriptionType: string) => {
        return await this.model.findOne({ subscriptionType });
    }

    //---------------------------------
    // Patient | Landing Page | Purchase a subscription plan .. 
    //---------------------------------
    purchaseSubscriptionForSuplify = async (subscriptionPlanId: string, _user: IUser/*, userId: string | undefined*/) => {
        //  User → Clicks "Buy Plan"
        //        ↓
        // Backend → Creates Checkout Session (stripe.checkout.sessions.create)
        //        ↓
        // Stripe → Returns session.url
        //        ↓
        // User → Redirected to Stripe Checkout
        //        ↓
        // User → Completes payment
        //        ↓
        // Stripe → Redirects to /success?session_id=cs_test_xxx
        //        ↓
        // Frontend → Extracts session_id
        //        ↓
        // Frontend → Calls YOUR API: GET /api/subscription/verify-session?session_id=...
        //        ↓
        // Backend → Calls Stripe: checkout.sessions.retrieve(session_id)
        //        ↓
        // Backend → Returns safe data (plan, amount, status)
        //        ↓
        // Frontend → Shows success UI, logs analytics, redirects

        const {userId} = _user;
        
        let subscriptionPlan: ISubscriptionPlan | null = await SubscriptionPlan.findById(subscriptionPlanId);
        if (!subscriptionPlan) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                `Subscription plan not found`
            );
        }
        const user:TUser | null = await User.findById(userId);
        if (!user) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'User not found'
            );
        }
        if (user.subscriptionType !== TSubscription.none) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'User is already subscribed to a plan'
            );
        }

        //---------------------------------
        // If stripeCustomerId found .. we dont need to create that .. 
        //---------------------------------   

        let stripeCustomer;
        if(!user.stripe_customer_id){
            let _stripeCustomer = await stripe.customers.create({
                name: user?.name,
                email: user?.email,
            });
            
            stripeCustomer = _stripeCustomer.id;

            await User.findByIdAndUpdate(user?._id, { $set: { stripe_customer_id: stripeCustomer } });
            
        }else{
            stripeCustomer = user.stripe_customer_id;
        }

        //---------------------------------
        // Lets create a userSubscription // TODO : we have to check already have userSubsription or not .. 
        //---------------------------------

        const newUserSubscription : IUserSubscription = await UserSubscription.create({
            userId: user._id, //🔗
            subscriptionPlanId : null, //🔗this will be assign after free trial end .. if stripe charge 70 dollar .. and in webhook we update this with standard plan 
            subscriptionStartDate: null, //new Date()
            currentPeriodStartDate: null, // new Date(), // ⚡ we will update this in webhook after successful payment
            expirationDate: null, // new Date(new Date().setDate(new Date().getDate() + 1)), // 1 days free trial
            isFromFreeTrial: false, // this is not from free trial
            cancelledAtPeriodEnd : false,
            status : UserSubscriptionStatusType.processing,
            // isAutoRenewed : 70 dollar pay houar pore true hobe 
            // billingCycle :  it should be 1 .. after first 70 dollar payment 
            // renewalDate : will be updated after 70 dollar for standard plan successful payment in webhook 
            stripe_subscription_id: null, // because its free trial // after 70 dollar payment we will update this 
            stripe_transaction_id : null, // because its free trial // after 70 dollar payment we will update this 
        
            // ⚡⚡⚡⚡ must null assign korte hobe renewal date e 

            /******
             * 
             * when a user cancel his subscription
             * 
             * we add that date at ** cancelledAt **
             * 
             * ** status ** -> cancelled
             * 
             * ******* */
        
        });

        // Create a new subscription
        // const subscription = await this.stripe.subscriptions.create({
        //   customer: stripeCustomer,
        //   items: [{ price: subscriptionPlan.stripe_price_id }],
        //   expand: ['latest_invoice.payment_intent'],
        // });


        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomer,
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                price: subscriptionPlan.stripe_price_id,
                quantity: 1,
                },
            ],
            // 🎯 Pass metadata to access later in webhooks
            subscription_data: {
                metadata: {
                userId: user._id.toString(),
                subscriptionType: TSubscription.standard.toString(),
                subscriptionPlanId: subscriptionPlan._id.toString(),
                referenceId: newUserSubscription._id.toString(),
                referenceFor:  TTransactionFor.UserSubscription.toString(),
                /*****
                 * payment successful
                 * 
                 * we need to create a payment transaction for this userSubscription
                 * for that we need referenceId and referenceFor
                 * 
                 * ******* */
                currency : TCurrency.usd.toString(),
                amount : subscriptionPlan.amount.toString()
                },
            },
            // ✅ Top-level metadata (available directly on session)
            metadata: {
                referenceId: newUserSubscription._id.toString(),
                referenceFor: TTransactionFor.UserSubscription.toString(),
                user : JSON.stringify(_user), // for handlePaymentSucceeded 
                currency: TCurrency.usd.toString(),
                amount: subscriptionPlan.amount.toString(),

                subscriptionType: subscriptionPlan.subscriptionType.toString(),
                subscriptionPlanId: subscriptionPlan._id.toString(),
                userId: user._id.toString(),
                planNickname: subscriptionPlan.subscriptionName.toString(), // e.g., "Pro Plan"
                
               /*******
                referenceId: newUserSubscription._id.toString(),
                referenceFor: TTransactionFor.UserSubscription.toString(),
                currency: TCurrency.usd.toString(),
                amount: subscriptionPlan.amount.toString(),
                user : JSON.stringify(_user),
                ****** */
            },
            // success_url: `${config.app.frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            // cancel_url: `${config.app.frontendUrl}/pricing`,
            success_url: config.stripe.success_url,
            cancel_url: config.stripe.cancel_url,
        });

        return session.url;
    }
}


    /*
    // 4. Helper Methods for Different Webhook Events
    // 4.1 Handle Checkout Session Completed
    handleCheckoutSessionCompleted = async (session: any) => {
        // Implement your logic here
        const { userId, subscriptionPlanId } = session.metadata;
  
        if (!userId || !subscriptionPlanId) {
            console.error('Missing metadata in checkout session');
            return;
        }

        // Retrieve subscription details from Stripe
        const subscription = await this.stripe.subscriptions.retrieve(session.subscription);
  
        // Get subscription plan details
        const subscriptionPlan = await this.getById(subscriptionPlanId);
        
        // Calculate dates
        const now = new Date();
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // Create user subscription record
        const userSubscriptionData = {
            userId,
            subscriptionPlanId,
            subscriptionStartDate: now,
            currentPeriodStartDate: now,
            renewalDate: currentPeriodEnd,
            billingCycle: subscriptionPlan.initialDuration === 'month' ? 1 : 12,
            isAutoRenewed: true,
            status: UserSubscriptionStatusType.active,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer
        };

       
        // Create subscription in your database
        await this.userSubscriptionService.create(userSubscriptionData); 

    }


    handleInvoicePaymentSucceeded = async (invoice: any) => {
        if (!invoice.subscription) return;
  
        // Get user subscription by Stripe subscription ID
        const userSubscription = await userSubscriptionService.getByStripeSubscriptionId(invoice.subscription);
        
        if (!userSubscription) {
            console.error('User subscription not found for invoice payment', invoice.subscription);
            return;
        }

        // Calculate new period dates
        const currentPeriodStart = new Date(invoice.period_start * 1000);
        const renewalDate = new Date(invoice.period_end * 1000);

        // Update user subscription
        await userSubscriptionService.update(userSubscription._id, {
            currentPeriodStartDate: currentPeriodStart,
            renewalDate: renewalDate,
            status: UserSubscriptionStatusType.active
        });
    }

    handleInvoicePaymentFailed = async (invoice: any) => {
        if (!invoice.subscription) return;
  
        // Get user subscription by Stripe subscription ID
        const userSubscription = await userSubscriptionService.getByStripeSubscriptionId(invoice.subscription);
        
        if (!userSubscription) {
            console.error('User subscription not found for failed payment', invoice.subscription);
            return;
        }

        // Update status to past_due
        await userSubscriptionService.update(userSubscription._id, {
            status: UserSubscriptionStatusType.past_due
        });
        
        // Here you might want to trigger a notification to the user
    }

    // 4.4 Handle Subscription Updated
    handleSubscriptionUpdated = async (subscription: any) => {
        // Get user subscription by Stripe subscription ID
        const userSubscription = await userSubscriptionService.getByStripeSubscriptionId(subscription.id);
        
        if (!userSubscription) {
            console.error('User subscription not found for update', subscription.id);
            return;
        }

        // Update status and other details
        const updates: any = {};
        
        // Map Stripe status to your status
        switch (subscription.status) {
            case 'active':
            updates.status = UserSubscriptionStatusType.active;
            break;
            case 'past_due':
            updates.status = UserSubscriptionStatusType.past_due;
            break;
            case 'unpaid':
            updates.status = UserSubscriptionStatusType.unpaid;
            break;
            case 'canceled':
            updates.status = UserSubscriptionStatusType.cancelled;
            updates.cancelledAt = new Date();
            break;
            case 'trialing':
            updates.status = UserSubscriptionStatusType.trialing;
            break;
            case 'incomplete':
            updates.status = UserSubscriptionStatusType.incomplete;
            break;
            case 'incomplete_expired':
            updates.status = UserSubscriptionStatusType.incomplete_expired;
            break;
        }

        // Handle cancellation at period end
        if (subscription.cancel_at_period_end) {
            updates.cancelledAtPeriodEnd = true;
        } else {
            updates.cancelledAtPeriodEnd = false;
        }

        // Update current period dates if available
        if (subscription.current_period_start) {
            updates.currentPeriodStartDate = new Date(subscription.current_period_start * 1000);
        }
        
        if (subscription.current_period_end) {
            updates.renewalDate = new Date(subscription.current_period_end * 1000);
        }

        // Update subscription in database
        await userSubscriptionService.update(userSubscription._id, updates);
    }

    
    // 4.5 Handle Subscription Canceled
private async handleSubscriptionCanceled(subscription: any) {
  // Get user subscription by Stripe subscription ID
  const userSubscription = await userSubscriptionService.getByStripeSubscriptionId(subscription.id);
  
  if (!userSubscription) {
    console.error('User subscription not found for cancellation', subscription.id);
    return;
  }

  // Update subscription status
  await userSubscriptionService.update(userSubscription._id, {
    status: UserSubscriptionStatusType.cancelled,
    cancelledAt: new Date()
  });
}

// 5. Service Methods for User Subscription
// Example method to find by Stripe subscription ID
userSubscriptionService.getByStripeSubscriptionId = async (stripeSubscriptionId: string) => {
  return await UserSubscription.findOne({ 
    stripe_subscription_id: stripeSubscriptionId,
    isDeleted: false 
  });
};


*/