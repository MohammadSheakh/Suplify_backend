import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { PaymentTransactionService } from './paymentTransaction.service';
import { PaymentTransaction } from './paymentTransaction.model';
import { IPaymentTransaction } from './paymentTransaction.interface';
import catchAsync from '../../../shared/catchAsync';
import { config } from '../../../config';
import ApiError from '../../../errors/ApiError';
import Stripe from 'stripe';
import stripe from '../../../config/stripe.config';


export class PaymentTransactionController extends GenericController<
  typeof PaymentTransaction,
  IPaymentTransaction
> {
  paymentTransactionService = new PaymentTransactionService();
  private stripe: Stripe;

  constructor() {
    super(new PaymentTransactionService(), 'paymentTransaction');
    this.stripe = stripe;
  }

  successPage = catchAsync(async (req: Request, res: Response) => {

    console.log("🟢 success page")

     const { session_id } = req.query;

    if (!session_id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Session ID is required');
    }

    const session = await this.stripe.checkout.sessions.retrieve(session_id as string, {
      expand: ['subscription']
    });

    // Extract safe data
    const responseData = {
      sessionId: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total ? (session.amount_total / 100) : 0,
      currency: session.currency?.toUpperCase(),
      subscriptionId: session.subscription ? (session.subscription as any).id : null,
      planNickname: session.metadata?.planNickname || 'N/A',
      subscriptionType: session.metadata?.subscriptionType || 'N/A',
      customerEmail: session.customer_details?.email || 'N/A',
      customerName: session.customer_details?.name || 'N/A',
    };
    
    res.render('success.ejs', { frontEndHomePageUrl: config.client.url,
       data: responseData // 👈 Pass session data here
     });

    // sendResponse(res, {
    //   code: StatusCodes.OK,
    //   data: result,
    //   message: `All ${this.modelName} with pagination`,
    //   success: true,
    // });
  });

  cancelPage = catchAsync(async (req: Request, res: Response) => {
    res.render('cancel.ejs', { frontEndHomePageUrl: config.client.url });
  });

  // add more methods here if needed or override the existing ones 
}
