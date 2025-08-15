import { StatusCodes } from 'http-status-codes';
import { CartItem } from './CartItem.model';
import { ICartItem } from './CartItem.interface';
import { GenericService } from '../__Generic/generic.services';


export class CartItemService extends GenericService<
  typeof CartItem,
  ICartItem
> {
  constructor() {
    super(CartItem);
  }
}
