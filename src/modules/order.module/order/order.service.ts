//@ts-ignore
import Stripe from "stripe";
import ApiError from "../../../errors/ApiError";
import { GenericService } from "../../_generic-module/generic.services";
import { IUser } from "../../token/token.interface";
import { User } from "../../user/user.model";
import { Cart } from "../cart/cart.model";
import { CartItem } from "../cartItem/cartItem.model";
import { OrderItem } from "../orderItem/orderItem.model";
import { OrderStatus, PaymentStatus, TOrderRelatedTo } from "./order.constant";
import { ICartItem, ICreateOrder, IOrder } from "./order.interface";
import { Order } from "./order.model";
//@ts-ignore
import {StatusCodes} from 'http-status' 
import stripe from "../../../config/stripe.config";
//@ts-ignore
import mongoose from "mongoose";
import { config } from "../../../config";
import { TTransactionFor } from "../../payment.module/paymentTransaction/paymentTransaction.constant";
import { TCurrency } from "../../../enums/payment";
import { ICart } from "../cart/cart.interface";

export class OrderService extends GenericService<typeof Order, IOrder>{
    private stripe: Stripe;

    constructor(){
        super(Order)
        this.stripe = stripe;
    }

    async createV2(data:Partial<ICreateOrder>, user: IUser) : Promise<IOrder> {

        /*********
         * 📝
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

        let stripeResult ;
        
        try {
        //---------------------------------
        // If stripeCustomerId found .. we dont need to create that .. 
        //---------------------------------  

        let stripeCustomer;
        if(!user.stripe_customer_id){
            let _stripeCustomer = await stripe.customers.create({
                name: user?.userName,
                email: user?.email,
            });
            
            stripeCustomer = _stripeCustomer.id;

            await User.findByIdAndUpdate(user?.userId, { $set: { stripe_customer_id: stripeCustomer.id } });
        }else{
            stripeCustomer = user.stripe_customer_id;
        }


        const session = await mongoose.startSession();

        let finalAmount = 0;
        let createdOrder = null;
        let cart : ICart;

        // session.startTransaction();
        await session.withTransaction(async () => {
            // Check if cart exists
            cart = await Cart.findOne({ 
                _id: data.cartId,
                isDeleted: false
             }).session(session);
            
            if (!cart) {
                throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');
            }

            const order:IOrder = new Order({
                userId: user?.userId,
                orderRelatedTo:  TOrderRelatedTo.product,
                status : OrderStatus.pending,
                shippingAddress: {
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode,
                    country: data.country
                },
                // deliveryCharge // need to think about this

                paymentTransactionId : null,
                paymentStatus : PaymentStatus.unpaid,
                finalAmount: 0 // we will update this later in this function
            })

            //---------------------------------
            // get all cartItems by cartId
            //---------------------------------

            const cartItems:ICartItem[] = await CartItem.find({ cartId: cart._id, isDeleted: false })
            .populate({
                path:"itemId",
                select:"price"
                // which help to add orderItems unitPrice and totalPrice
            }).lean<ICartItem[]>().session(session);
            
            if (!cartItems.length) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "No Cart Item Found !");
            }

            createdOrder = await order.save({ session }); /***** we have to check its return id or not ************ */
        
            // Create order items
            for (const item of cartItems) {
                if (typeof item.itemId === "object" && "price" in item.itemId) {
                    finalAmount += item.quantity * item.itemId.price;

                    //TODO: we need to check quantity lower than stock quantity
                    await OrderItem.create([
                    {
                        orderId: createdOrder._id,
                        itemId: item.itemId._id,
                        quantity: item.quantity,
                        unitPrice: item.itemId.price,
                        totalPrice: item.quantity * item.itemId.price,
                    }], { session });
                } else {
                    throw new Error("itemId was not populated with price");
                }
            }

            console.log("🟢 Final Amount (before delivery charge): ", finalAmount);

            // add that final amount to order
            // order.finalAmount = finalAmount;

            await Order.findByIdAndUpdate(
                createdOrder._id,
                { $set: { finalAmount } },
                { new: true, session }
            );

            
            // console.log("🟢🟢 created Order :: ", createdOrder)
        });
        session.endSession();
        
        const stripeSessionData: any = {
            payment_method_types: ['card'],
            mode: 'payment',
            customer: stripeCustomer.id,
            line_items: [
                {
                    price_data: {
                        currency: TCurrency.usd, // must be small letter
                        product_data: {
                            name: 'Amount',
                        },
                        unit_amount: finalAmount! * 100, // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                /*****
                 * 📝
                 * we receive these data in webhook ..
                 * based on this data .. we have to update our database in webhook ..
                 * also give user a response ..
                 * 
                 * now as our system has multiple feature that related to payment 
                 * so we provide all related data as object and stringify that ..
                 * also provide .. for which category these information we passing ..
                 * 
                 * like we have multiple usecase like
                 * 1. Product Order,
                 * 2. Lab Booking,
                 * 3. Doctor Appointment 
                 * 4. Specialist Workout Class Booking,
                 * 5. Training Program Buying .. 
                 *  
                 * **** */
                referenceId: createdOrder._id.toString(), // in webhook .. in PaymentTransaction Table .. this should be referenceId
                referenceFor: TTransactionFor.Order, // in webhook .. this should be the referenceFor
                currency: TCurrency.usd,
                amount: finalAmount.toString(),
                user: JSON.stringify(user), // who created this order  // as we have to send notification also may be need to send email
                referenceId2: cart._id.toString(),
                referenceFor2: "Cart",
                /******
                 * 📝
                 * With this information .. first we create a 
                 * PaymentTransaction ..  where paymentStatus[Complete]
                 *  +++++++++++++++++++++ transactionId :: coming from Stripe
                 * ++++++++++++++++++++++ paymentIntent :: coming from stripe .. or we generate this 
                 * ++++++++++++++++++++++ gatewayResponse :: whatever coming from stripe .. we save those for further log
                 * 
                 * We also UPDATE Order Infomation .. 
                 * 
                 * status [ ]
                 * paymentTransactionId [🆔]
                 * paymentStatus [paid]
                 * 
                 * ******* */
            },
            success_url: config.stripe.success_url,
            cancel_url: config.stripe.cancel_url,
        };


        try {
            const session = await stripe.checkout.sessions.create(stripeSessionData);
            console.log({
                    url: session.url,
            });
            stripeResult = { url: session.url };
        } catch (error) {
            console.log({ error });
        }

        } catch (err) {
            console.error("🛑 Error While creating Order", err);
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Order creation failed');
        }

        //======================================= From Co pilot
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

        return  stripeResult; // result ;//session.url;
    }
}