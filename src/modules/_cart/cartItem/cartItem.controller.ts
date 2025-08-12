import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../__Generic/generic.controller';
import { CartItem } from './CartItem.model';
import { ICartItem } from './CartItem.interface';
import { CartItemService } from './CartItem.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class CartItemController extends GenericController<
  typeof CartItem,
  ICartItem
> {
  CartItemService = new CartItemService();

  constructor() {
    super(new CartItemService(), 'CartItem');
  }

  // add more methods here if needed or override the existing ones 
}
