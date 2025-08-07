import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../__Generic/generic.controller';
import { Product } from './product.model';
import { IProduct } from './product.interface';
import { ProductService } from './product.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class ProductController extends GenericController<
  typeof Product,
  IProduct
> {
  ProductService = new ProductService();

  constructor() {
    super(new ProductService(), 'Product');
  }

  // add more methods here if needed or override the existing ones 
}
