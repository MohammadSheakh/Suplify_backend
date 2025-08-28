import ApiError from "../../../errors/ApiError";
import { GenericService } from "../../_generic-module/generic.services";
import { Cart } from "../cart/cart.model";
import { CartItem } from "../cartItem/cartItem.model";
import { OrderItem } from "../orderItem/orderItem.model";
import { OrderStatus, PaymentStatus, TOrderRelatedTo } from "./order.constant";
import { ICreateOrder, IOrder } from "./order.interface";
import { Order } from "./order.model";
import {StatusCodes} from 'http-status' 

export class OrderService extends GenericService<typeof Order, IOrder>{
    constructor(){
        super(Order)
    }

    async createV2(data:Partial<ICreateOrder>) : Promise<IOrder> {
        
        /*********
         * 
         * 1. We need to find out Cart is Exist or not ..
         * 2. ++ if not we return Error
         * 3. ++ if Yes We check Cart has at least 1 cartItem..
         * 4. ++++++ We Create Order [OrderStatus.pending] [PaymentStatus.unpaid] [PaymentTransactionId = null]
         * 4. ++++++ if cartItem found .. and that validates .. like available quantity found ..
         *                              we create OrderItem
         * 5. ++ we Provide Stripe URL to payment .. 
         * -----------------------------------------------------------
         * 6. If Payment Successful .. its going to WEBHOOK 
         * 7. ++++ We create Payment Transaction .. 
         * 7. ++++ We update Order [OrderStatus.completed] [PaymentStatus.paid] [PaymentTransactionId = <transaction_id>]
         * 
         * ******* */

        // Check if cart exists
        const cart = await Cart.findOne({ _id: data.cartId });
        // console.log("🟢🟢", cart)
        if (!cart) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');
        }

        
        // Create order
        // const order = await this.model.create({
        //     userId: data.loggedInUserId,
        //     orderRelatedTo:  TOrderRelatedTo.product,
        //     status : OrderStatus.pending,
        //     shippingAddress: {
        //         address: data.address,
        //         city: data.city,
        //         state: data.state,
        //         zipCode: data.zipCode,
        //         country: data.country
        //     },
        //     // deliveryCharge // need to think about this

        //     PaymentTransactionId : null,
        //     paymentStatus : PaymentStatus.unpaid,
        // });

        /*******
         * 
         * get all cartItems by cartId
         * 
         * ******* */

        const cartItems = await CartItem.find({ cartId: cart._id })
        .populate({
            path:"itemId",
            select:"price"
            // which help to add orderItems unitPrice and totalPrice
        });
        /// 🟢 itemId theke ki ki populate korte hobe .. shegula chinta korte hobe 

        // console.log("🟢🟢 cartItems ", cartItems)

        // Create order items
        for (const item of cartItems) {
            await OrderItem.create({
                order: order._id,
                itemId: item.itemId._id,
                quantity: item.quantity,
                unitPrice: item.itemId.price,
                totalPrice: item.quantity * item.itemId.price,
            });
        }


        const stripeCustomer = await stripe.customers.create({
                    name: thisCustomer?.full_name,
                    email: thisCustomer?.email,
               });

        // findbyid and update the user
        await User.findByIdAndUpdate(thisCustomer?.id, { $set: { stripeCustomerId: stripeCustomer.id } });
        const stripeSessionData: any = {
            payment_method_types: ['card'],
            mode: 'payment',
            customer: stripeCustomer.id,
            line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Amount',
                            },
                            unit_amount: order.finalAmount! * 100, // Convert to cents
                        },
                        quantity: 1,
                    },
            ],
            metadata: {
                    products: JSON.stringify(orderData.products), // only array are allowed TO PASS as metadata
                    coupon: orderData.coupon?.toString(),
                    shippingAddress: orderData.shippingAddress,
                    paymentMethod: orderData.paymentMethod,
                    user: user.id,
                    shop: orderData.shop,
                    amount: order.finalAmount,
            },
            success_url: config.stripe.success_url,
            cancel_url: config.stripe.cancel_url,
        };


        try {
            const session = await stripe.checkout.sessions.create(stripeSessionData);
            console.log({
                    url: session.url,
            });
            result = { url: session.url };
        } catch (error) {
            console.log({ error });
        }

        // Provide Stripe URL for payment
        // const session = await stripe.checkout.sessions.create({
        //     payment_method_types: ['card'],
        //     line_items: cartItems.map(item => ({
        //         price_data: {
        //             currency: 'usd',
        //             product: item.itemId,
        //             unit_amount: item.unitPrice * 100,
        //         },
        //         quantity: item.quantity,
        //     })),
        //     mode: 'payment',
        //     success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        //     cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        // });

        return result ;//session.url;
    }

}