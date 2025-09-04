//@ts-ignore
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { GenericController } from '../../_generic-module/generic.controller';
import { IConfirmPayment, ISubscriptionPlan } from './subscriptionPlan.interface';
import { SubscriptionPlanService } from './subscriptionPlan.service';
import sendResponse from '../../../shared/sendResponse';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
//@ts-ignore
import Stripe from 'stripe';
import ApiError from '../../../errors/ApiError';
import { TInitialDuration, TRenewalFrequency } from './subscriptionPlan.constant';
import { User } from '../../user/user.model';
import { UserCustomService } from '../../user/user.service';
//@ts-ignore
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
import { UserSubscription } from '../userSubscription/userSubscription.model';
import { config } from '../../../config';

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
    // TODO : in middleware we have to validate this subscriptionPlanId

    const { subscriptionPlanId } = req.params;
    
    if (!subscriptionPlanId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Subscription Plan ID is required in params' // TODO :  do this validation in middleware
      );
    }

    const checkoutUrl = await new SubscriptionPlanService()
    .purchaseSubscriptionForSuplify(
      subscriptionPlanId,
      (req.user as IUser).userId
    );


    // 🔗 Send Checkout URL to frontend
    sendResponse(res, {
        code: StatusCodes.OK,
        data: checkoutUrl,
        message: `Redirect to Checkout`,
        success: true,
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
