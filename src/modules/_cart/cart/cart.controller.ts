import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { Cart } from './Cart.model';
import { ICart } from './Cart.interface';
import { CartService } from './Cart.service';


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
