//@ts-ignore
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

  async viewCart(cartId: string, userId : string): Promise<ICart | null> {

    // const cart = await this.model.findById(cartId);
    const cart = await this.model.findOne({
      isDeleted: false,
      userId: userId
    });

    console.log("🟡cart🟡 ", cart);

    if(!cart){
      throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');
    }

    /*****
     * 
     * find all cartItem of that cart
     * ***** */
    // const cartItems = await CartItem.find({ cartId }, { __v: 0, updatedAt:0 }).populate({
    //   path: 'itemId',
    //   select: 'name attachments price stockQuantity'
    // });

    const cartItems = await CartItem.find({ cartId: cart._id, isDeleted: false }, { __v: 0, updatedAt:0 }).populate({
      path: 'itemId',
      select: 'name attachments price stockQuantity',
      populate:{
        path: 'attachments',
        select: 'attachment'
      }
    });

    console.log("cartItems ", cartItems);

    return cartItems;

    // return await this.model.findById(cartId).populate('items.productId');
  }
}
