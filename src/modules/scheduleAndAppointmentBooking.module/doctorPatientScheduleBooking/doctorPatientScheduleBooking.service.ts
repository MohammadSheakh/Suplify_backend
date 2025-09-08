//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { DoctorPatientScheduleBooking } from './doctorPatientScheduleBooking.model';
import { IDoctorPatientScheduleBooking } from './doctorPatientScheduleBooking.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { IUser } from '../../token/token.interface';
//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import Stripe from "stripe";
import stripe from '../../../config/stripe.config';
import { User } from '../../user/user.model';
import ApiError from '../../../errors/ApiError';
import { config } from '../../../config';
import { TSubscription } from '../../../enums/subscription';
import { TDoctorAppointmentScheduleStatus } from '../doctorAppointmentSchedule/doctorAppointmentSchedule.constant';
import { IDoctorAppointmentSchedule } from '../doctorAppointmentSchedule/doctorAppointmentSchedule.interface';
import { TAppointmentStatus } from './doctorPatientScheduleBooking.constant';
import { TPaymentStatus } from '../specialistPatientScheduleBooking/specialistPatientScheduleBooking.constant';

export class DoctorPatientScheduleBookingService extends GenericService<
  typeof DoctorPatientScheduleBooking,
  IDoctorPatientScheduleBooking> 
  {
    private stripe: Stripe;
    constructor() {
        super(DoctorPatientScheduleBooking);
        this.stripe = stripe;
    }

    async createV2(doctorScheduleId: string, user: IUser) : Promise<IDoctorPatientScheduleBooking> 
    {
        /******
         * 📝
         * First We have to check user's subscriptionPlan
         * 1. if "none".. we dont let him to book appointment
         * 2. if "freeTrial" .. need to pay // TODO : need to talk with client about this feature
         * 3. if "standard" or "standardPlus" .. they need to pay to book appointment
         * 4. if "vise" ... no payment required to book appointment
         * ******* */
    
        if(user.subscriptionPlan === TSubscription.none){
            throw new ApiError(StatusCodes.FORBIDDEN, 'You need to subscribe a plan to book appointment with doctor');
        }

        const existingSchedule:IDoctorAppointmentSchedule = await DoctorPatientScheduleBooking.findOne({
            id: doctorScheduleId,
            status: TDoctorAppointmentScheduleStatus.available 
            // { $in: [TDoctorAppointmentScheduleStatus.available] } // Check for both pending and scheduled statuses
        });
        if (!existingSchedule) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Doctor schedule not found');
        }

        if(user.subscriptionPlan == TSubscription.vise){
            // no payment required ..
            /******
             * 
             * check appointment schedule 
             * if scheduleStatus[available]
             * if scheduleDate >= today
             * if timeLeft > 0 // so, we dont think about startTime .. 
             * ++++++ create doctorPatientScheduleBooking
             * **** */

            const createBooking = await this.create({
                patientId: user.userId,
                doctorScheduleId: existingSchedule._id,
                doctorId: existingSchedule.createdBy,// ⚡ this will help us to query easily
                status:  TAppointmentStatus.scheduled,
                paymentTransactionId: null,
                paymentMethod: null,
                paymentStatus: TPaymentStatus.unpaid,
            });

            /***
             * TODO : MUST : send notification to doctor and patient
             * ** */

            return  createBooking;
        }

        /*********
         * 📝
         * 3  ++++++ First Make DoctorAppointmentSchedule [scheduleStatus.booked] after payment done .. we add  [booked_by = patientId]
         * 4. ++++++ We Create DoctorPatientScheduleBooking [status.pending] [PaymentStatus.unpaid] [PaymentTransactionId = null]
         * 5. ++ we Provide Stripe URL to payment .. 
         * -----------------------------------------------------------
         * 6. If Payment Successful .. its going to WEBHOOK 
         * 7. ++++ We create Payment Transaction .. 
         * 7. ++++ We update DoctorPatientScheduleBooking [status.scheduled] [PaymentStatus.paid] [PaymentTransactionId = <transaction_id>]
         * 8. ++++ We update DoctorAppointmentSchedule [booked_by = patientId]
         * 
         * 9. If Payment Failed .. its going to WEBHOOK
         * 10. ++++ We update DoctorPatientScheduleBooking [status.cancelled] [PaymentStatus.failed] [PaymentTransactionId = null] 
         * 11. ++++ We update DoctorAppointmentSchedule [scheduleStatus.available] [booked_by = null]
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

        
        let createdOrder = null;
        

        // session.startTransaction();
        await session.withTransaction(async () => {
            /****
             * 
             * check labTest exist or not TODO :
             * 
             * *** */

            const createdDoctorPatientScheduleBooking: IDoctorPatientScheduleBooking = new DoctorPatientScheduleBooking({
                patientId: user.userId,
                doctorScheduleId: existingSchedule._id,
                doctorId: existingSchedule.createdBy,// ⚡ this will help us to query easily
                status:  TAppointmentStatus.scheduled,

                paymentTransactionId : null,
                paymentStatus : TPaymentStatus.unpaid,
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
