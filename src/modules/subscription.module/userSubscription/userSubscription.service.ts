import ApiError from "../../../errors/ApiError";
import { GenericService } from "../../_generic-module/generic.services";
import { TUser } from "../../user/user.interface";
import { User } from "../../user/user.model";
import { IUserSubscription } from "./userSubscription.interface";
import { UserSubscription } from "./userSubscription.model";
import { StatusCodes } from 'http-status-codes';
import stripe from "../../../config/stripe.config";
import Stripe from "stripe";
import { config } from "../../../config";
import { TSubscription } from "../../../enums/subscription";
import { TTransactionFor } from "../../payment.module/paymentTransaction/paymentTransaction.constant";
import { TCurrency } from "../../../enums/payment";
import { SubscriptionPlan } from "../subscriptionPlan/subscriptionPlan.model";
import { ISubscriptionPlan } from "../subscriptionPlan/subscriptionPlan.interface";
import { UserSubscriptionStatusType } from "./userSubscription.constant";

export class UserSubscriptionService extends GenericService<typeof UserSubscription, IUserSubscription>{
    private stripe: Stripe;

    constructor(){
        super(UserSubscription)
        this.stripe = stripe;
    }

    startFreeTrial = async (userId: string | undefined): Promise<any> => {
        /*******
         *  1. check users hasUsedFreeTrial 
         *  2. +++++++ if true -> it means user is not eligible for free trial
         *  3. +++++++ if false -> he can start free trial .. 
         *  4. -----------------------------
         *  5. we need to make sure after 7 days free trial end .. in what subscription rate 
         *  6. we charge that customer .. 
         *  7. we need to create a stripe checkout session for the user so that
         *  8. we can collect payment information and start the free trial ... 
         *  9. after 7 days it will automatically upgrade the user to the selected subscription plan
         *  10. **** hasUsedFreeTrial should be set to true
         * 
         * ***** */
        
        const user:TUser = await User.findById(userId);

        if(user.hasUsedFreeTrial){
            return new ApiError(StatusCodes.FORBIDDEN, 'User is not eligible for free trial');
        }

        // Start the free trial // TODO:
        // user.hasUsedFreeTrial = true;
        // await user.save();
        // we need stripe customer id 


        let stripeCustomer;
        if(!user.stripe_customer_id){
            let _stripeCustomer = await stripe.customers.create({
                name: user?.name, // name because this user is coming from database not JWT Token
                email: user?.email,
            });
            
            stripeCustomer = _stripeCustomer.id;

            await User.findByIdAndUpdate(user?._id, { $set: { stripe_customer_id: stripeCustomer.id } });
        }else{
            stripeCustomer = user.stripe_customer_id;
        }
        //---------------------------------
        // get active standard plan priceId from database
        //---------------------------------
        const standardPlan:ISubscriptionPlan = await SubscriptionPlan.findOne({
            subscriptionType: TSubscription.standard,
            isActive: true
        });

        // console.log("⚡ standardPlan :: ", standardPlan);

        if(!standardPlan){
            return new ApiError(StatusCodes.NOT_FOUND, 'No active standard plan found');
        }
        //---------------------------------
        // Lets create a userSubscription // TODO : we have to check already have userSubsription or not .. 
        //---------------------------------

        const newUserSubscription : IUserSubscription = await UserSubscription.create({
            userId: user._id, //🔗
            subscriptionPlanId : null, //🔗this will be assign after free trial end .. if stripe charge 70 dollar .. and in webhook we update this with standard plan 
            subscriptionStartDate: new Date(),
            currentPeriodStartDate: null, // new Date(), // ⚡ we will update this in webhook after successful payment
            expirationDate: null, // new Date(new Date().setDate(new Date().getDate() + 1)), // 1 days free trial
            isFromFreeTrial: true, // this is from free trial
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

        // Create Stripe Checkout Session for trial with card collection
        const session = await stripe.checkout.sessions.create({
        customer: stripeCustomer,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{
            price: standardPlan.stripe_price_id, /*config.stripe.standard_plan_price_id,*/
            //---------------------------------
            // 🟢 70 dollar er priceId provide korte hobe .. which is comes from env file 
            //---------------------------------
            quantity: 1,
        }],
        
        // 🎯 KEY: TRIAL SETUP WITH CARD COLLECTION
        subscription_data: {
            trial_period_days: 1, // 1 days
            metadata: {
                userId: user._id.toString(),
                subscriptionType: TSubscription.standard.toString(),
                subscriptionPlanId: standardPlan._id.toString(),
                referenceId: newUserSubscription._id.toString(),
                referenceFor:  TTransactionFor.UserSubscription.toString(),
                /*****
                 * because after 7 days .. after 70 dollar payment successful
                 * 
                 * we need to create a payment transaction for this userSubscription
                 * for that we need referenceId and referenceFor
                 * 
                 * ******* */
                currency : TCurrency.usd.toString(),
                amount : '70'.toString() // because its free trial and customer just book this
            }
        },
        success_url: config.stripe.success_url,
        cancel_url: config.stripe.cancel_url,
        });

        // TODO MUST :  Try catch use korte hobe 

        return session.url;
    }
}

///////////////// OPTIONS ... 
// Collect card but don't charge immediately
// payment_intent_data: {
//     setup_future_usage: 'off_session', // Save card for future charges
// },


//////////////// GIVEN BY GPT 
// Success/Cancel URLs
// success_url: `${process.env.FRONTEND_URL}/trial-success?session_id={CHECKOUT_SESSION_ID}`,
// cancel_url: `${process.env.FRONTEND_URL}/trial-cancelled`,