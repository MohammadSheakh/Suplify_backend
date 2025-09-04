import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { GenericController } from '../../_generic-module/generic.controller';
import { IConfirmPayment, ISubscriptionPlan } from './subscriptionPlan.interface';
import { SubscriptionPlanService } from './subscriptionPlan.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import ApiError from '../../../errors/ApiError';
import { TInitialDuration, TRenewalFrequency } from './subscriptionPlan.constant';
import { User } from '../../user/user.model';
import { UserCustomService } from '../../user/user.service';
import mongoose from 'mongoose';
import { PaymentTransactionService } from '../../payment.module/paymentTransaction/paymentTransaction.service';
import { SubscriptionPlan } from './subscriptionPlan.model';

import { TCurrency } from '../../../enums/payment';
import stripe from "../../../config/stripe.config";
import { IUser } from '../../token/token.interface';
import { TSubscription } from '../../../enums/subscription';
import { TTransactionFor } from '../../payment.module/paymentTransaction/paymentTransaction.constant';
import { IUserSubscription } from '../userSubscription/userSubscription.interface';
import { UserSubscriptionStatusType } from '../userSubscription/userSubscription.constant';

const subscriptionPlanService = new SubscriptionPlanService();
const userCustomService = new UserCustomService();

const paymentTransactionService = new PaymentTransactionService();

export class SubscriptionController extends GenericController<
  typeof SubscriptionPlan,
  ISubscriptionPlan
> {
  private stripe: Stripe;

  constructor() {
    super(new SubscriptionPlanService(), 'Subscription Plan');
    // Initialize Stripe with secret key (from your Stripe Dashboard) // https://dashboard.stripe.com/test/dashboard
    this.stripe = stripe;
  }

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

  purchaseSubscriptionForSuplify = catchAsync(async (req: Request, res: Response) => {
    const { subscriptionPlanId } = req.params;
    
    if (!subscriptionPlanId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Subscription Plan ID is required in params' // TODO :  do this validation in middleware
      );
    }

    let subscriptionPlan: ISubscriptionPlan | null = await SubscriptionPlan.findById(subscriptionPlanId);
    if (!subscriptionPlan) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Subscription plan not found`
      );
    }
    const user = await User.findById((req.user as IUser).userId);
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

    /*****
     * 
     * If stripeCustomerId found .. we dont need to create that .. 
     * 
     * ***** */    

    let stripeCustomer;
    if(!user.stripe_customer_id){
        let _stripeCustomer = await stripe.customers.create({
            name: user?.userName,
            email: user?.email,
        });
        
        stripeCustomer = _stripeCustomer.id;

        await User.findByIdAndUpdate(user?.userId, { $set: { stripe_customer_id: stripeCustomer.id } });
    }else{
        stripeCustomer = user.stripe_customer_id;
    }


    /*******
     * 
     * Lets create a userSubscription // TODO : we have to check already have userSubsription or not .. 
     * 
     * ******* */

    const newUserSubscription : IUserSubscription = await UserSubscription.create({
        userId: user._id, //🔗
        subscriptionPlanId : null, //🔗this will be assign after free trial end .. if stripe charge 70 dollar .. and in webhook we update this with standard plan 
        subscriptionStartDate: new Date(),
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
          referenceId: subscriptionPlan._id.toString(),
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
        },
      },
      success_url: `${config.app.frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.app.frontendUrl}/pricing`,
    });

    // 🔗 Send Checkout URL to frontend
    res.status(200).json({
      success: true,
      message: 'Redirect to Checkout',
      data: {
        url: session.url,
      },
    });


    res.status(200).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription,
    });

  });

  
  // ⚡⚡ For Fertie Project to suplify project
  /*
   * As Admin can create subscription plan ...
   * // TODO MUST : this should move to service layer .. 
   * Lets Create 3 Subscription Plan  
   *
  */  
  create = catchAsync(async (req: Request, res: Response) => {

    /************
     //> make is active false of already existing subscription plan .. 
     * 
     * ***** */

    const existingPlan = await SubscriptionPlan.find({
      isActive: true,
      subscriptionType : req.body.subscriptionType
    });

    existingPlan.forEach(async (plan:ISubscriptionPlan) => {
      plan.isActive = false;
      await plan.save();
    });

    const data : ISubscriptionPlan = req.body;
    
    data.subscriptionName = req.body.subscriptionName;
    data.amount = req.body.amount;
    data.subscriptionType = req.body.subscriptionType;
    data.initialDuration = TInitialDuration.month;
    data.renewalFrequncy = TRenewalFrequency.monthly;
    data.currency = TCurrency.usd;
  
    // now we have to create stripe product and price 
    // and then we have to save the productId and priceId in our database
    const product = await this.stripe.products.create({
      name: data.subscriptionType,
      description: `Subscription plan for ${data.subscriptionType}`,
    });

    const price = await this.stripe.prices.create({
      unit_amount: Math.round(parseFloat(data?.amount) * 100), // Amount in cents
      currency: data.currency,
      // -- as i dont want to make this recurring ... 
      recurring: {
        interval: 'month', // or 'year' for yearly subscriptions
        interval_count: 1, // every 1 month
      },
      product: product.id,
    });
    data.stripe_product_id = product.id;
    data.stripe_price_id = price.id;
    data.isActive = true;

    const result = await this.service.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  }
  );

  /*
    if admin wants to update a subscription plan , 
    then we have to create new stripe product and price and update the productId and priceId in our database

    lets see how it goes .. we can modify it later if needed
  */  

  updateById = catchAsync(async (req: Request, res: Response) => {
    const data : ISubscriptionPlan = req.body;
    
    data.subscriptionName = req.body.subscriptionName;
    data.amount = req.body.amount;
    data.subscriptionType = TSubscription.premium;
    data.initialDuration = TInitialDuration.month;
    data.renewalFrequncy = TRenewalFrequency.monthly;
    data.currency = TCurrency.usd;
    data.features = req.body.features;

    if(!data.amount){
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `amount is required`
      );
    }

    // now we have to create stripe product and price 
    // and then we have to save the productId and priceId in our database
    const product = await this.stripe.products.create({
      name: data.subscriptionType,
      description: `Subscription plan for ${data.subscriptionType}`,
    });

    const price = await this.stripe.prices.create({
      unit_amount: data?.amount * 100, // Amount in cents
      currency: data.currency,
      recurring: {
        interval: 'month', // or 'year' for yearly subscriptions
        interval_count: 1, // Number of intervals (e.g., 1 month)
      },
      product: product.id,
    });
    
    data.stripe_product_id = product.id;
    data.stripe_price_id = price.id;

    const result = await this.service.updateById(req.params.id, data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} updated successfully`,
      success: true,
    });
  });



  // add more methods here if needed or override the existing ones
}
