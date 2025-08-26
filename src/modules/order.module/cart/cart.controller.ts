import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Cart } from './cart.model';
import { ICart } from './Cart.interface';
import { CartService } from './cart.service';


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

  // add more methods here if needed or override the existing ones 
}
