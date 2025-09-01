import { StatusCodes } from 'http-status-codes';
import { DoctorPatientScheduleBooking } from './doctorPatientScheduleBooking.model';
import { IDoctorPatientScheduleBooking } from './doctorPatientScheduleBooking.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { IUser } from '../../token/token.interface';
import Stripe from "stripe";
import stripe from '../../../config/stripe.config';

export class DoctorPatientScheduleBookingService extends GenericService<
  typeof DoctorPatientScheduleBooking,
  IDoctorPatientScheduleBooking> 
  {

  private stripe: Stripe;
  constructor() {
    super(DoctorPatientScheduleBooking);
    this.stripe = stripe;
  }

  async createV2(doctorScheduleId: string, user: IUser) : Promise<IDoctorPatientScheduleBooking> {

        /*********
         * 
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
        /*****
         * 
         * If stripeCustomerId found .. we dont need to create that .. 
         * 
         * ***** */    

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
        

        // session.startTransaction();
        await session.withTransaction(async () => {
            /****
             * 
             * check labTest exist or not TODO :
             * 
             * *** */

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

            
            console.log("🟢 Final Amount (before delivery charge): ", finalAmount);

            // add that final amount to order
            // order.finalAmount = finalAmount;

            await Order.findByIdAndUpdate(
            createdOrder._id,
                { $set: { finalAmount } },
                { new: true, session }
            );

            console.log("🟢🟢 created Order :: ", createdOrder)
        });
        session.endSession();
        
        const stripeSessionData: any = {
            payment_method_types: ['card'],
            mode: 'payment',
            customer: stripeCustomer.id,
            line_items: [
                    {
                        price_data: {
                            currency: 'usd', // must be small letter
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
                 *
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
                referenceFor: "Order", // in webhook .. this should be the referenceFor
                currency: "usd",
                amount: finalAmount.toString(),
                user: JSON.stringify(user) // who created this order  // as we have to send notification also may be need to send email
                
                /******
                 * 
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

        return  stripeResult; // result ;//session.url;
    }
}
