//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { SpecialistPatientScheduleBooking } from './specialistPatientScheduleBooking.model';
import { ISpecialistPatientScheduleBooking } from './specialistPatientScheduleBooking.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { IUser } from '../../token/token.interface';
import ApiError from '../../../errors/ApiError';
import { TSubscription } from '../../../enums/subscription';
import { User } from '../../user/user.model';
import { ISpecialistPatient } from '../../personRelationships.module/specialistPatient/specialistPatient.interface';
import { SpecialistPatient } from '../../personRelationships.module/specialistPatient/specialistPatient.model';
import { SpecialistWorkoutClassSchedule } from '../specialistWorkoutClassSchedule/specialistWorkoutClassSchedule.model';
//@ts-ignore
import mongoose from 'mongoose';
import { TPaymentStatus } from './specialistPatientScheduleBooking.constant';
//@ts-ignore
import Stripe from "stripe";
import stripe from "../../../config/stripe.config";


export class SpecialistPatientScheduleBookingService extends GenericService<
  typeof SpecialistPatientScheduleBooking,
  ISpecialistPatientScheduleBooking
> {
  private stripe: Stripe; 
  
  constructor() {
    super(SpecialistPatientScheduleBooking);
    this.stripe = stripe;
  }

  async createV2(workoutClassId :string ,  user: IUser) : Promise<ISpecialistPatientScheduleBooking | null | {url : any}> {


    /******
     * 📝
     * First We have to check user's subscriptionPlan
     * 1. if "none".. we dont let him to book appointment
     * 2. if "freeTrial" .. need to pay // TODO : need to talk with client about this feature
     * 3. if "standard" or "standardPlus" .. they need to pay to book appointment
     * 4. if "vise" ... no payment required to book appointment
     * ******* */

    const existingUser = await User.findById(user.userId).select('+subscriptionPlan +stripe_customer_id');
    
    
    const checkAlreadyBooked = await SpecialistPatientScheduleBooking.findOne({
      workoutClassId,
      patientId: user.userId
    });

    if(checkAlreadyBooked){
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You have already booked this workout class');
    }

    // TODO : Need to test
    if(existingUser.subscriptionPlan === TSubscription.none){
        throw new ApiError(StatusCodes.FORBIDDEN, 'You need to subscribe a plan to book appointment with doctor');
    }

    //check workout class exist or not
    const existingWorkoutClass = await SpecialistWorkoutClassSchedule.findById(workoutClassId);
    if(!existingWorkoutClass){
        throw new ApiError(StatusCodes.NOT_FOUND, 'Workout Class not found');
    }

    /********
     * 📝
     * here we also check if relation ship between specialist and patient exist or not
     *  if not then we create the relationship 
     */
    
    // TODO : Need Test this code .. if already relation exist .. it should not create duplicate relation
    const specialistPatientRelation:ISpecialistPatient = await SpecialistPatient.findOne({
        specialistId: existingWorkoutClass.createdBy,
        patientId: user.userId
    });

    if (specialistPatientRelation === null) {
        // Create the relationship if it doesn't exist
        // TODO : Need Test this code .. if already relation exist .. it should not create duplicate relation 
        const newRelation:ISpecialistPatient = new SpecialistPatient({
            specialistId: existingTrainingProgram.createdBy,
            patientId: user.userId
        });

        const savedRelation = await newRelation.save();
    }

    if(existingUser.subscriptionType == TSubscription.vise){
        // ⚠️    ->  bad code .. Need to optimize .. need to use insertMany for bulk insert
        // no payment required ..
        /******
         * 📝  
         * ++++++ create specialistPatientScheduleBooking for workout class  
         * **** */
        const session = await mongoose.startSession();

        let bookWorkoutClass : ISpecialistPatientScheduleBooking | null = null;
        try {
        await session.withTransaction(async () => {

            bookWorkoutClass = await this.create({
                patientId: user.userId,
                workoutClassScheduleId : existingWorkoutClass._id,
                specialistId: existingWorkoutClass.createdBy,// ⚡ this will help us to query easily
                paymentTransactionId: null, // in webhook we will update this
                paymentMethod: null, // in webhook we will update this
                paymentStatus: TPaymentStatus.unpaid, // in webhook we will update this

                endTime : existingWorkoutClass.endTime,
                startTime: existingWorkoutClass.startTime,
                scheduleDate: existingWorkoutClass.scheduleDate,

                price: parseInt(existingWorkoutClass.price)
            });

        });
        } catch (error) {
        console.error("Transaction failed:", error);
        // handle/log/throw depending on your app logic
        } finally {
        await session.endSession();
        }

        /***
         * TODO : MUST : send notification to doctor and patient
         * ** */

        return bookWorkoutClass
    }


    /*********
     * 📝
     * 4. ++++++ For Booking we create SpecialistPatientScheduleBooking  
     *                              [PaymentStatus.unpaid] [PaymentTransactionId = null]
     * 5. ++ we Provide Stripe URL to payment .. 
     * -----------------------------------------------------------
     * 6. If Payment Successful .. its going to WEBHOOK 
     * 7. ++++ We create Payment Transaction .. 
     * 7. ++++ We update SpecialistPatientScheduleBooking [PaymentStatus.paid] [PaymentTransactionId = <transaction_id>]
     * 
     * ******* */

    let stripeResult ;
    let bookWorkoutClass : ISpecialistPatientScheduleBooking | null = null;
    
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
       
        bookWorkoutClass = await this.create({
            patientId: user.userId,
            workoutClassScheduleId : existingWorkoutClass._id,
            specialistId: existingWorkoutClass.createdBy,// ⚡ this will help us to query easily
            paymentTransactionId: null, // in webhook we will update this
            paymentMethod: null, // in webhook we will update this
            paymentStatus: TPaymentStatus.unpaid, // in webhook we will update this

            endTime : existingWorkoutClass.endTime,
            startTime: existingWorkoutClass.startTime,
            scheduleDate: existingWorkoutClass.scheduleDate,

            price: parseInt(existingWorkoutClass.price)
        });

        
        console.log("bookWorkoutClass :: 🟢🟢 ", bookWorkoutClass)

    });
    session.endSession();

    if(!bookWorkoutClass){
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Booking failed');
    }
    
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
