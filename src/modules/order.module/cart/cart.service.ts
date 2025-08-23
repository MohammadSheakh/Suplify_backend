import { StatusCodes } from 'http-status-codes';
import { Cart } from './cart.model';
import { ICart } from './cart.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class CartService extends GenericService<
  typeof Cart,
  ICart
> {
  constructor() {
    super(Cart);
  }
}
