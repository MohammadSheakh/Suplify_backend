import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { PaymentTransactionService } from './paymentTransaction.service';
import { PaymentTransaction } from './paymentTransaction.model';
import { IPaymentTransaction } from './paymentTransaction.interface';
import catchAsync from '../../../shared/catchAsync';
import { config } from '../../../config';

// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class PaymentTransactionController extends GenericController<
  typeof PaymentTransaction,
  IPaymentTransaction
> {
  paymentTransactionService = new PaymentTransactionService();

  constructor() {
    super(new PaymentTransactionService(), 'paymentTransaction');
  }

  successPage = catchAsync(async (req: Request, res: Response) => {

    console.log("🟢 success page")
    
    res.render('success.ejs', { frontEndHomePageUrl: config.client.url });

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
