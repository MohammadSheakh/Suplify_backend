import { StatusCodes } from 'http-status-codes';
import { CartItem } from './cartItem.model';
import { ICartItem } from './cartItem.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class CartItemService extends GenericService<
  typeof CartItem,
  ICartItem
> {
  constructor() {
    super(CartItem);
  }
}
