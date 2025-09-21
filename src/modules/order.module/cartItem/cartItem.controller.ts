import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { CartItem } from './cartItem.model';
import { ICartItem, ICreateCart } from './cartItem.interface';
import { CartItemService } from './cartItem.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { Cart } from '../cart/cart.model';
import { ICart } from '../cart/cart.interface';


export class CartItemController extends GenericController<
  typeof CartItem,
  ICartItem
> {
  CartItemService = new CartItemService();

  constructor() {
    super(new CartItemService(), 'CartItem');
  }

  /*********
   * 
   * Patient | Dashboard | add to cart 
   * 
   * ******* */
  create = catchAsync(async (req: Request, res: Response) => {
    const data:ICreateCart = req.body;

    console.log(data);

    /****
     * check Logged in users Cart exist or not 
     * ***** */

    const existedCart =  await Cart.findOne({
      userId: req.user.userId
    })

    let cartId;
    let newCart:ICart | any;

    if (!existedCart) {
      // Create a new cart if it doesn't exist
      newCart = await Cart.create({
        userId: req.user.userId
      });

      cartId = newCart._id;
      console.log('New cart created:', newCart);
    } else {

      cartId = existedCart._id;
      console.log('Existed cart found:', existedCart);
    }

    /******
     * lets insert cart item 
     * 
     * before that .. 
     * we need to check itemId is already created
     * or not as cartItem 
     *  
     * ***** */

    const isCartItemExist:ICartItem | any = await CartItem.findOne({
      cartId: cartId,
      itemId: data.itemId
    })

    let newCartItem:ICartItem | any
    if(isCartItemExist){
      /*****
       * we just update quantity of that cartItem
       * **** */
      isCartItemExist.quantity += 1;
      
      await isCartItemExist.save();

      // existedCart.itemCount += 1; // Increment item count
      await existedCart.save();

    }else{
      /****
       * insert new cartItem
       * ** */
      newCartItem = new CartItem({
        cartId: cartId,
        itemId: data.itemId,
        quantity: 1
      });

      await newCartItem.save();

      if(existedCart){
        existedCart.itemCount += 1; // Increment item count
        await existedCart.save();
      }

      if(newCart){
        newCart.itemCount += 1; // Increment item count
        await newCart.save();
      }
      
    }

    
    // const result = await this.service.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: isCartItemExist ? isCartItemExist : newCartItem,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
