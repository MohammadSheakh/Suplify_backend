import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Cart } from './cart.model';
import { ICart } from './cart.interface';
import { CartService } from './cart.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class CartController extends GenericController<
  typeof Cart,
  ICart
> {
  CartService = new CartService();

  constructor() {
    super(new CartService(), 'Cart');
  }

  viewCart = catchAsync(async (req: Request, res: Response) => {
    console.log("🟢 HIt")
    const cart = await this.CartService.viewCart(req.params.cartId);
    sendResponse(res, {
      code: StatusCodes.OK,
      data: cart,
      message: 'Cart retrieved successfully',
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
