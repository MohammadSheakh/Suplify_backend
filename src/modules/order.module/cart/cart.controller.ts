import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Cart } from './cart.model';
import { ICart } from './cart.interface';
import { CartService } from './cart.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';


export class CartController extends GenericController<
  typeof Cart,
  ICart
> {
  CartService = new CartService();

  constructor() {
    super(new CartService(), 'Cart');
  }

  viewCart = catchAsync(async (req: Request, res: Response) => {
    const cart = await this.CartService.viewCart(req.query.cartId); // we need to pass cartId
    sendResponse(res, {
      code: StatusCodes.OK,
      data: cart,
      message: 'Cart retrieved successfully',
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
