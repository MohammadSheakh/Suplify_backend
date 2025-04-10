import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { GenericController } from "../../__Generic/generic.controller";
import { ISubscription } from "./subscription.interface";
import { Subscription } from "./subscription.model";
import { SubscriptionService } from "./subscription.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";


const subscriptionService = new SubscriptionService();

export class SubscriptionController extends GenericController<typeof Subscription, ISubscription> {
    
    private stripe: Stripe;

    constructor(){
        super(new SubscriptionService(), "Subscription")
        // Initialize Stripe with secret key (from your Stripe Dashboard)
        this.stripe = new Stripe("your_stripe_secret_key");
    }
    subscribe = catchAsync(async (req: Request, res: Response) => {
        // get product price by the plan parameter 
        // plan parameter comes from req.query 
        const { plan} = req.query;
        const { userId } = req.user;

        // check if plan is valid
        const validPLan = await subscriptionService.

        /// productId and priceId duita e lagbe .. stripe er .. 
        /// check out session er shomoy .. 

        // if we have own database with plans table .. make sure 
        // make sure we have both stripe productId and priceId .. 


        // when a customer subscribe a plan  .. we need to create stripe 
        // check out session .. 

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
              {
                price_data: {
                  currency: "usd", // or your preferred currency
                  product_data: {
                    name: plan.name,
                    description: plan.description,
                  },
                  unit_amount: plan.price * 100, // Amount in cents
                },
                quantity: 1,
              },
            ],
            mode: "subscription", // You can change it to 'payment' if it's a one-time payment
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            metadata: {
              userId: userId, // Store userId or other data in metadata for future reference
            },
          });

        const data = req.body;
        const result = await this.service.create(data);
    
        sendResponse(res, {
          code: StatusCodes.OK,
          data: result,
          message: `${this.modelName} created successfully`,
          success: true,
        });
      });
}