import { StatusCodes } from 'http-status-codes';
import { IBookLabTest, ILabTestBooking, ILabTestBookingModel } from './labTestBooking.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { LabTestBooking } from './labTestBooking.model';
import { IUser } from '../../token/token.interface';
import Stripe from "stripe";
import stripe from '../../../config/stripe.config';
import { User } from '../../user/user.model';
import mongoose from "mongoose";
import { Product } from '../../store.module/product/product.model';
import ApiError from '../../../errors/ApiError';
import { PaymentStatus } from '../../order.module/order/order.constant';
import { IProduct } from '../../store.module/product/product.interface';
import { TTransactionFor } from '../../payment.module/paymentTransaction/paymentTransaction.constant';
import { TCurrency } from '../../../enums/payment';
import { config } from '../../../config';

export class LabTestBookingService extends GenericService<
  typeof LabTestBooking,
  ILabTestBooking
> {
  private stripe: Stripe;
  constructor() {
    super(LabTestBooking);
    this.stripe = stripe;
  }

  async createV2(data:Partial<IBookLabTest>, user: IUser) : Promise<ILabTestBooking> {

        /*********
         * 
         * 1. ++++++ We Create LabTestBooking [status.pending] [PaymentStatus.unpaid] [PaymentTransactionId = null]
         * 2. ++ we Provide Stripe URL to payment .. 
         * -----------------------------------------------------------
         * 6. If Payment Successful .. its going to WEBHOOK 
         * 7. ++++ We create Payment Transaction .. referenceId should be that labTestId, referenceFor should be "LabTestBooking"
         * 7. ++++ We update LabTestBooking [status.confirmed] [PaymentStatus.paid] [PaymentTransactionId = <transaction_id>]
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
         let createdBooking = null;

        // session.startTransaction();
        await session.withTransaction(async () => {
            /****
             * 
             * check labTest exist or not TODO :
             * 
             * *** */

            let isLabTestExist:IProduct = await Product.findById(data.labTestId).session(session);

            if(!isLabTestExist){
                throw new ApiError(StatusCodes.NOT_FOUND, "Lab Test not found");
            }

            finalAmount = isLabTestExist.price;

            // now we have to create LabTestBooking
            const bookedLabTest:ILabTestBooking = new LabTestBooking({
                patientId: user?.userId, // logged in user
                labTestId : isLabTestExist._id,
                appointmentDate : data?.appointmentDate,
                startTime: data?.startTime,
                endTime: data?.endTime,
               
                address: data.address,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                country: data.country,
                
                paymentTransactionId : null,
                paymentStatus : PaymentStatus.unpaid,
                finalAmount: isLabTestExist.price
            })

            createdBooking = await bookedLabTest.save({ session });

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
                referenceId: createdBooking._id.toString(), // in webhook .. in PaymentTransaction Table .. this should be referenceId
                referenceFor: TTransactionFor.LabTestBooking, // in webhook .. this should be the referenceFor
                currency: TCurrency.usd,
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
