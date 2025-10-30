//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { IBookLabTest, ILabTestBooking, ILabTestBookingModel } from './labTestBooking.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { LabTestBooking } from './labTestBooking.model';
import { IUser } from '../../token/token.interface';
//@ts-ignore
import Stripe from "stripe";
import stripe from '../../../config/stripe.config';
import { User } from '../../user/user.model';
//@ts-ignore
import mongoose from "mongoose";
import { Product } from '../../store.module/product/product.model';
import ApiError from '../../../errors/ApiError';
import { PaymentStatus } from '../../order.module/order/order.constant';
import { IProduct } from '../../store.module/product/product.interface';
import { TTransactionFor } from '../../payment.module/paymentTransaction/paymentTransaction.constant';
import { TCurrency } from '../../../enums/payment';
import { config } from '../../../config';
import { toUTCTime } from '../../../utils/timezone';
import { TSubscription } from '../../../enums/subscription';
import { enqueueWebNotification } from '../../../services/notification.service';
import { TRole } from '../../../middlewares/roles';
import { TNotificationType } from '../../notification/notification.constants';

export class LabTestBookingService extends GenericService<
  typeof LabTestBooking,
  ILabTestBooking
> {
  private stripe: Stripe;
  constructor() {
    super(LabTestBooking);
    this.stripe = stripe;
  }

  async createV2(data:Partial<IBookLabTest>, user: IUser, userTimeZone: string) : Promise<ILabTestBooking> {

    /********
     * 📝
     * Here first we have to check 
     * appointmentDate , startTime , endTime
     * -------------------------------
     * date time valid or not 
     * ****** */
    if(data.appointmentDate && data.startTime && data.endTime) {
        const appointmentDate = new Date(data.appointmentDate);
        
        data.startTime = toUTCTime(data.startTime, userTimeZone); // we need to convert to UTC before saving in DB
        data.endTime = toUTCTime(data.endTime, userTimeZone);

        if(isNaN(appointmentDate.getTime()) || isNaN(data.startTime.getTime()) || isNaN(data.endTime.getTime())) {
            throw new Error('Invalid date or time format');
        }

        if(data.startTime >= data.endTime) {
            throw new Error('Start time must be before end time');
        }
        const now = new Date();
        if(data.startTime < now) {
            throw new Error('Start time must be in the future');
        }

    } else {
        throw new Error('appointmentDate, startTime and endTime are required');
    }

    /******
     * 📝
     * First We have to check user's subscriptionPlan
     * 1. if "none".. we dont let him to book appointment
     * 2. if "freeTrial" .. need to pay // TODO : need to talk with client about this feature
     * 3. if "standard" or "standardPlus" .. they need to pay to book appointment
     * 4. if "vise" ... no payment required to book appointment
     * ******* */

    const existingUser = await User.findById(user.userId).select('+subscriptionPlan +stripe_customer_id');
    
    // TODO : Need to test
    if(existingUser.subscriptionPlan === TSubscription.none){
        throw new ApiError(StatusCodes.FORBIDDEN, 'You need to subscribe a plan to book a lab test');
    }

    if(existingUser.subscriptionType == TSubscription.vise){
        // ⚠️    ->  bad code .. Need to optimize .. need to use insertMany for bulk insert
        // no payment required ..
        /******
         * 📝  
         * ++++++ create specialistPatientScheduleBooking for workout class  
         * **** */
        const session = await mongoose.startSession();

        let bookedLabTest : ILabTestBooking | null = null;
        try {
            await session.withTransaction(async () => {

                // Lets check lab test exist or not
                let isLabTestExist:IProduct = await Product.findById(data.labTestId).session(session);
                if(!isLabTestExist){
                    throw new ApiError(StatusCodes.NOT_FOUND, "Lab Test not found");
                }

                bookedLabTest = new LabTestBooking({
                    patientId: user?.userId, // logged in user
                    labTestId : data.labTestId,
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
                    paymentMethod: null,
                    finalAmount: isLabTestExist.price
                })

                bookedLabTest = await bookedLabTest.save({ session });

            
                //--------------------------------- 
                // Lets send notification to admin that patient has booked lab test
                //---------------------------------
                await enqueueWebNotification(
                    `${isLabTestExist.name} booked by a ${existingUser.subscriptionType} user ${existingUser.name} , userId is ${existingUser._id}`,
                    existingUser._id, // senderId
                    null , // receiverId // as reciever is admin .. so null
                    TRole.admin, // receiverRole
                    TNotificationType.labTestBooking, // type
                    /**********
                     * In UI there is no details page for booked lab test
                     * **** */
                    'labTestId', // linkFor
                    bookedLabTest?._id // linkId
                    // TTransactionFor.TrainingProgramPurchase, // referenceFor
                    // purchaseTrainingProgram._id // referenceId
                );


            });
        } catch (error) {
            console.error("Transaction failed:", error);
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Workout class Booking failed');
        // handle/log/throw depending on your app logic
        } finally {
            await session.endSession();
        }

        return bookedLabTest
    }

    /*********
     * 📝🥇
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

        await User.findByIdAndUpdate(user?.userId, { $set: { stripe_customer_id: stripeCustomer } });
    }else{
        stripeCustomer = user.stripe_customer_id;
    }

    const session = await mongoose.startSession();

        let finalAmount = 0;
        let createdBooking = null;

    // session.startTransaction();
    await session.withTransaction(async () => {
        /****
         * TODO :
         * check labTest exist or not 
         * must add session in all db operation inside transaction
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
            referenceId: createdBooking._id.toString(), // in webhook .. in PaymentTransaction Table .. this should be referenceId
            referenceFor: TTransactionFor.LabTestBooking, // in webhook .. this should be the referenceFor
            currency: TCurrency.usd,
            amount: finalAmount.toString(),
            user: JSON.stringify(user) // who created this order  // as we have to send notification also may be need to send email
            
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

    return stripeResult; // result ;//session.url;

    }
}
