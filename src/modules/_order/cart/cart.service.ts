import { StatusCodes } from 'http-status-codes';
import { Cart } from './Cart.model';
import { ICart } from './Cart.interface';
import { GenericService } from '../__Generic/generic.services';


export class CartService extends GenericService<
  typeof Cart,
  ICart
> {
  constructor() {
    super(Cart);
  }
}
