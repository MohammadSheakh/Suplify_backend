import { StatusCodes } from 'http-status-codes';
import { Cart } from './cart.model';
import { ICart } from './cart.interface';
import { GenericService } from '../../_generic-module/generic.services';
import ApiError from '../../../errors/ApiError';
import { CartItem } from '../cartItem/cartItem.model';


export class CartService extends GenericService<
  typeof Cart,
  ICart
> {
  constructor() {
    super(Cart);
  }

  async viewCart(cartId: string): Promise<ICart | null> {

    const cart = await this.model.findById(cartId);

    if(!cart){
      throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');
    }

    /*****
     * 
     * find all cartItem of that cart
     * ***** */
    const cartItems = await CartItem.find({ cartId }).populate({
      path: 'itemId',
      select: 'name attachments price stockQuantity'
    });

    return cartItems;

    // return await this.model.findById(cartId).populate('items.productId');
  }
}
