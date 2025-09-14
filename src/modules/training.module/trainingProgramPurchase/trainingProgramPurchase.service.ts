//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { TrainingProgramPurchase } from './trainingProgramPurchase.model';
import { ITrainingProgramPurchase } from './trainingProgramPurchase.interface';
import { GenericService } from '../../_generic-module/generic.services';
import ApiError from '../../../errors/ApiError';
import { TCurrency } from '../../../enums/payment';
import { config } from '../../../config';
import { IUser } from '../../token/token.interface';
import stripe from "../../../config/stripe.config";
//@ts-ignore
import Stripe from "stripe";
import { User } from '../../user/user.model';
import { PaymentStatus } from '../../order.module/order/order.constant';
import { TrainingProgram } from '../trainingProgram/trainingProgram.model';
import { TTransactionFor } from '../../payment.module/paymentTransaction/paymentTransaction.constant';
import { TSubscription } from '../../../enums/subscription';
import { SpecialistPatient } from '../../personRelationships.module/specialistPatient/specialistPatient.model';

export class TrainingProgramPurchaseService extends GenericService<
  typeof TrainingProgramPurchase,
  ITrainingProgramPurchase
> {
  private stripe: Stripe;

  constructor() {
    super(TrainingProgramPurchase);
    this.stripe = stripe;
  }

  async createV2(trainingProgramId:string, user: IUser) : Promise<ITrainingProgramPurchase | null | { url: any}> {

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

    const existingTrainingProgram = await TrainingProgram.find({
      _id: trainingProgramId,
    })

    if (!existingTrainingProgram) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Training program not found');
    }

    /********
     * 📝
     * here we also check if relation ship between doctor and patient exist or not
     *  if not then we create the relationship 
     */
    
    const specialistPatientRelation = await SpecialistPatient.findOne({
        doctorId: existingTrainingProgram.createdBy,
        patientId: user.userId
    });

    if (!specialistPatientRelation) {
      // Create the relationship if it doesn't exist
      const newRelation = new SpecialistPatient({
          doctorId: existingTrainingProgram.createdBy,
          patientId: user.userId
      });
      await newRelation.save();
    }


    if(user.subscriptionPlan == TSubscription.vise){
      // no payment required ..
      /******
       * 📝
       * check appointment schedule 
       * if scheduleStatus[available]
       * if scheduleDate >= today
       * if timeLeft > 0 // so, we dont think about startTime .. //TODO :
       * ++++++ create doctorPatientScheduleBooking
       * 
       * **** */

      existingSchedule.scheduleStatus = TDoctorAppointmentScheduleStatus.booked;
      existingSchedule.booked_by = user.userId;

      const createdBooking = await this.create({
          patientId: user.userId,
          doctorScheduleId: existingSchedule._id,
          doctorId: existingSchedule.createdBy,// ⚡ this will help us to query easily
          status:  TAppointmentStatus.scheduled,
          paymentTransactionId: null,
          paymentMethod: null,
          paymentStatus: TPaymentStatus.unpaid,

          scheduleDate: existingSchedule.scheduleDate,
          startTime: existingSchedule.startTime,
          endTime: existingSchedule.endTime,
          
          price: parseInt(existingSchedule.price)
      });

      /***
       * TODO : MUST : send notification to doctor and patient
       * ** */

      await existingSchedule.save();

      return  createdBooking;
    }


    /*********
     * 📝
     * 1. We need to check user accessToken's subscription status ..
     * 2. +++ if vise .. they can book without payment ... 
     * 3. +++ if not vise .. they need to pay to purchase .. 
     * 4. ++++++ For purchase ..we create TrainingProgramPurchase 
     *                          [PaymentStatus.unpaid] [PaymentTransactionId = null]
     * 
     * 5. ++ we Provide Stripe URL to payment .. 
     * -----------------------------------------------------------
     * 6. If Payment Successful .. its going to WEBHOOK 
     * 7. ++++ We create Payment Transaction .. 
     * 7. ++++ We update TrainingProgramPurchase [PaymentStatus.paid] [PaymentTransactionId = <transaction_id>]
     * 
     * ******* */

    let stripeResult ;
    let trainingProgramPurchase : ITrainingProgramPurchase;
    
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

    // session.startTransaction();
    await session.withTransaction(async () => {

      /*****
       * TODO :  
       * Mongoose er session add korte hobe ..
       * ****** */
      const trainingProgram = await TrainingProgram.findById(data.trainingProgramId).select('price');

      if(!trainingProgram){
        throw new ApiError(StatusCodes.BAD_REQUEST, "No Training Program Found !");
      }

      trainingProgramPurchase = await TrainingProgramPurchase.create({
        trainingProgramId : data.trainingProgramId,  
        patientId: user?.userId,
        paymentTransactionId : null,
        paymentStatus : PaymentStatus.unpaid,
        price: trainingProgram.price
      })

    });
    session.endSession();

    //TODO : 
    if(!trainingProgramPurchase){
      throw new ApiError(StatusCodes.BAD_REQUEST, "No Training Program Purchase Found !");
    }
    /**********************
     * 
     * IN WEBHOOK ... what we have to do .... 
     * 
     * 
     * for every training session .. we have to create
     * patientTrainingSession.. 
     * 
     * also 
     * 
     * // 2. Get sessions of this program
        const sessions = await TrainingSession.find({ training_program_id: programId }).sort("sessionCount");

        // 3. Create PatientTrainingSession with unlock dates
        const patientSessions = sessions.map((session, index) => {
          const unlockDate = new Date(purchaseDate.getTime() + index * 7 * 24 * 60 * 60 * 1000);
          return {
            trainingSessionId: session._id,
            userId,
            status: "incomplete",
            unlockDate,
            isUnlocked: purchaseDate >= unlockDate, // first session unlocked immediately
          };
        });


        await PatientTrainingSession.insertMany(patientSessions);
      * 
      * 
      * 
      * 
      * ***************** */

    /***********
     * 
     * Not Create Related .. Its for viewing all training session .. for patient .. 
     * Real time lock unlock checking .. 
     * 
     * const getUserSessions = async (userId, programId) => {
          const today = new Date();

          const sessions = await PatientTrainingSession.find({
            userId,
          }).populate("trainingSessionId");

          // Update isUnlocked dynamically
          return sessions.map((s) => {
            const unlocked = today >= s.unlockDate;
            return {
              ...s.toObject(),
              isUnlocked: unlocked, // override with real-time check
            };
          });
        };
      * 
      * 
      * 
      * ***** */    

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
                        unit_amount : trainingProgramPurchase.price! * 100, // Convert to cents
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
            referenceId: trainingProgramPurchase._id.toString(), // in webhook .. in PaymentTransaction Table .. this should be referenceId
            referenceFor: TTransactionFor.TrainingProgramPurchase, // in webhook .. this should be the referenceFor
            currency: TCurrency.usd,
            amount: trainingProgramPurchase.price!.toString(), // TODO : FIX :  Must Check
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
