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
import mongoose from 'mongoose';
//@ts-ignore
import Stripe from "stripe";
import { User } from '../../user/user.model';
import { PaymentStatus } from '../../order.module/order/order.constant';
import { TrainingProgram } from '../trainingProgram/trainingProgram.model';
import { TTransactionFor } from '../../payment.module/paymentTransaction/paymentTransaction.constant';
import { TSubscription } from '../../../enums/subscription';
import { SpecialistPatient } from '../../personRelationships.module/specialistPatient/specialistPatient.model';
import { TPaymentStatus } from '../../scheduleAndAppointmentBooking.module/specialistPatientScheduleBooking/specialistPatientScheduleBooking.constant';
import { PatientTrainingSession } from '../patientTrainingSession/patientTrainingSession.model';
import { TrainingSession } from '../trainingSession/trainingSession.model';
import { ITrainingSession } from '../trainingSession/trainingSession.interface';
import { TUser } from '../../user/user.interface';
import { ITrainingProgram } from '../trainingProgram/trainingProgram.interface';
import { ISpecialistPatient } from '../../personRelationships.module/specialistPatient/specialistPatient.interface';
import { PatientTrainingSessionService } from '../patientTrainingSession/patientTrainingSession.service';
import { IPatientTrainingSession } from '../patientTrainingSession/PatientTrainingSession.interface';
import { notificationQueue } from '../../../helpers/bullmq/bullmq';
import { TRole } from '../../../middlewares/roles';
import { TNotificationType } from '../../notification/notification.constants';
import { enqueueWebNotification } from '../../../services/notification.service';
import { TRelationCreatedBy } from '../../personRelationships.module/doctorSpecialistPatient/doctorSpecialistPatient.constant';

const patientTrainingSessionService = new PatientTrainingSessionService();

export class TrainingProgramPurchaseService extends GenericService<
  typeof TrainingProgramPurchase,
  ITrainingProgramPurchase
> {
  private stripe: Stripe;

  constructor() {
    super(TrainingProgramPurchase);
    this.stripe = stripe;
  }

  /*****
   * 📝
   * we call this function from webhook as well as from createV2 function of this service .. 
   * 
   * here we create all patientTrainingSession for track all session for this patient
   * ** */
  async _handlePersonTrainingSessionCreate(trainingProgramId: string, user: IUser){
    
    const trainingSessions = await TrainingSession.find({
      trainingProgramId
    }).lean();

    /******
    trainingSessions.forEach( async (trainingSession : ITrainingSession) => {
      // create patientTrainingSession for each purchase

      const res =  await patientTrainingSessionService.create({
        patientId: user.userId,
        trainingSessionId: trainingSession._id,
        unlockDate: new Date( 
          // purchaseTrainingProgram.createdAt.getTime() 
          Date.now() + 
          (trainingSession.sessionCount - 1) * 7 * 24 * 60 * 60 * 1000
        ),
        isUnlocked: false, //  we will compute this in frontend // TODO : need to think about this 
      })
    });
    ******* */
    //📈⚙️ OPTIMIZATION: _handlePersonTrainingSessionCreate
    const patientTrainingSessionsData = trainingSessions.map(
      (trainingSession:ITrainingSession) => ({
        patientId: user.userId,
        trainingSessionId: trainingSession._id,
        unlockDate: new Date( 
          // purchaseTrainingProgram.createdAt.getTime()
          Date.now() + 
          (trainingSession.sessionCount - 1) * 7 * 24 * 60 * 60 * 1000
        ),
        isUnlocked: false, //  we will compute this in frontend // TODO : need to think about this 
      })
    )

    //📈⚙️ OPTIMIZATION: Use insertMany for bulk insert - much faster than individual creates
    if (patientTrainingSessionsData.length > 0) {
      
      await PatientTrainingSession.insertMany(patientTrainingSessionsData) as IPatientTrainingSession[];
    }

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

    const existingUser:TUser = await User.findById(user.userId).select('subscriptionType name');

    const checkAlreadyPurchased = await TrainingProgramPurchase.findOne({
      trainingProgramId,
      patientId: user.userId
    });

    if(checkAlreadyPurchased){
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You have already purchased this training program');
    }

    // TODO : Need to test
    if(existingUser.subscriptionType === TSubscription.none){
      throw new ApiError(StatusCodes.FORBIDDEN, 'You need to subscribe a plan to purchase training program');
    }

    const existingTrainingProgram :ITrainingProgram = await TrainingProgram.findOne({
      _id: trainingProgramId,
    })

    if (!existingTrainingProgram) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Training program not found');
    }

    /********
     * 📝
     * here we also check if relation ship between specialist and patient exist or not
     *  if not then we create the relationship 
     */
    
    // TODO : Need Test this code .. if already relation exist .. it should not create duplicate relation
    const specialistPatientRelation:ISpecialistPatient = await SpecialistPatient.findOne({
        specialistId: existingTrainingProgram.createdBy,
        patientId: user.userId
    });

    if (specialistPatientRelation === null) {
      // Create the relationship if it doesn't exist
      // TODO : Need Test this code .. if already relation exist .. it should not create duplicate relation 
      const newRelation:ISpecialistPatient = new SpecialistPatient({
          specialistId: existingTrainingProgram.createdBy,
          patientId: user.userId,
          relationCreatedBy : TRelationCreatedBy.purchasingService,
      });

      const savedRelation = await newRelation.save();
    }

    if(existingUser.subscriptionType == TSubscription.vise){
      // ⚠️    ->  bad code .. Need to optimize .. need to use insertMany for bulk insert
      // no payment required ..
      /******
       * 📝  
       * ++++++ create doctorPatientScheduleBooking 
       * **** */
      const session = await mongoose.startSession();

      let purchaseTrainingProgram : ITrainingProgramPurchase | null = null;
      try {
        await session.withTransaction(async () => {

          purchaseTrainingProgram = await this.create({
            patientId: user.userId,
            trainingProgramId: existingTrainingProgram._id,
            specialistId: existingTrainingProgram.createdBy,// ⚡ this will help us to query easily
            paymentTransactionId: null, // in webhook we will update this
            paymentMethod: null, // in webhook we will update this
            paymentStatus: TPaymentStatus.unpaid, // in webhook we will update this
            
            price: parseInt(existingTrainingProgram.price)
          });

          
          /*****
           * 📝
           * for this training program .. as there are multiple training session .. we have to create 
           * patientTrainingSession for each session and calculate unlock date based on purchase date
           * **** */

          await this._handlePersonTrainingSessionCreate(trainingProgramId, user);

          /**********
           * 🥇
           * Lets send notification to specialist that patient has purchased training program
           * ******* */
          await enqueueWebNotification(
            `${existingTrainingProgram.programName} purchased by a ${existingUser.subscriptionType} user ${existingUser.name} .  purchaseTrainingProgramId ${purchaseTrainingProgram._id}`,
            existingUser._id, // senderId
            existingTrainingProgram.createdBy, // receiverId
            TRole.specialist, // receiverRole
            TNotificationType.trainingProgramPurchase, // type
            'trainingProgramId', // linkFor
            existingTrainingProgram._id // linkId
            // TTransactionFor.TrainingProgramPurchase, // referenceFor
            // purchaseTrainingProgram._id // referenceId
          );

          //---------------------------------
          // Now send notification to admin that patient has purchased training program
          //---------------------------------

          await enqueueWebNotification(
            `${existingTrainingProgram.programName} Training Program of specialist ${existingTrainingProgram.createdBy} purchased by a ${existingUser.subscriptionType} user ${existingUser.name}. purchaseTrainingProgramId ${purchaseTrainingProgram._id}`,
            existingUser._id, // senderId
            null, // receiverId
            TRole.admin, // receiverRole
            TNotificationType.trainingProgramPurchase, // type
            null, // linkFor
            null // linkId
          );
          
        // return  purchaseTrainingProgram;
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

      return purchaseTrainingProgram
    }

    /*********
     * 📝
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
    let trainingProgramPurchase : ITrainingProgramPurchase | null;
    
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

    // session.startTransaction();
    await session.withTransaction(async () => {
  
      trainingProgramPurchase = await TrainingProgramPurchase.create(
        [{
          patientId: user?.userId,
          trainingProgramId : existingTrainingProgram._id,
          specialistId: existingTrainingProgram.createdBy, // ⚡ this will help us to query easily
          paymentMethod : null, // in webhook we will update this
          paymentTransactionId : null,  // in webhook we will update this
          paymentStatus : PaymentStatus.unpaid, // in webhook we will update this
          price: parseInt(existingTrainingProgram.price)
        }], { session }
      );

      console.log("purchaseTrainingProgram :: 🟢🟢 ", trainingProgramPurchase)

    });
    session.endSession();

    //TODO : 
    if(!trainingProgramPurchase){
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Training Program Purchasing Failed !");
    }
    
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
              unit_amount : trainingProgramPurchase[0].price! * 100, // Convert to cents
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
            referenceId: trainingProgramPurchase[0]._id.toString(), // in webhook .. in PaymentTransaction Table .. this should be referenceId
            referenceFor: TTransactionFor.TrainingProgramPurchase, // in webhook .. this should be the referenceFor
            currency: TCurrency.usd,
            amount: trainingProgramPurchase[0].price!.toString(), // TODO : FIX :  Must Check
            user: JSON.stringify(user), // who created this order  // as we have to send notification also may be need to send email
            referenceId2: existingTrainingProgram._id.toString(), // we need this to create patientTrainingSession
            
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

    return  stripeResult; // result ;//session.url;
  }
}
 

// /********
//  *  global method to send notification through bull queue
//  * ******** */
// async function enqueueWebNotification(
//   // existingTrainingProgram, user: any
//   title: string,
//   senderId: string,
//   receiverId: string,
//   receiverRole: string,
//   type: TNotificationType,
//   /****
//    * this linkFor is for navigation in front-end 
//    * so that in query we can pass linkFor=linkId
//    * **** */
//   linkFor: string,
//   /******
//    * value for linkFor query
//    * ***** */ 
//   linkId: string,
//   referenceFor?: TTransactionFor,
//   referenceId?: string
// ) {

//   const notifAdded = await notificationQueue.add(
//     'send-notification',
//     {
//       title,
//       senderId,
//       receiverId,
//       receiverRole,
//       type,
//       referenceFor, // what if referenceFor is null
//       referenceId // what if referenceId is null
//     },
//     {
//       attempts: 3,
//       backoff: {
//         type: 'exponential',
//         delay: 2000, // 2s, 4s, 8s
//       },
//       removeOnComplete: true,
//       removeOnFail: 1000, // keep failed jobs for debugging
//     }
//   );

//   console.log("🔔 enqueueWebNotification hit :: notifAdded -> ", notifAdded)
// }


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