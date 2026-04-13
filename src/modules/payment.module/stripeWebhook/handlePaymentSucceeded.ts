import ApiError from "../../../errors/ApiError";
import { TRole } from "../../../middlewares/roles";
import { enqueueWebNotification } from "../../../services/notification.service";
import { TNotificationType } from "../../notification/notification.constants";
import { Cart } from "../../order.module/cart/cart.model";
import { OrderStatus, PaymentMethod, PaymentStatus } from "../../order.module/order/order.constant";
import { IOrder } from "../../order.module/order/order.interface";
import { Order } from "../../order.module/order/order.model";
import { IDoctorAppointmentSchedule } from "../../scheduleAndAppointmentBooking.module/doctorAppointmentSchedule/doctorAppointmentSchedule.interface";
import { TAppointmentStatus } from "../../scheduleAndAppointmentBooking.module/doctorPatientScheduleBooking/doctorPatientScheduleBooking.constant";
import { IDoctorPatientScheduleBooking } from "../../scheduleAndAppointmentBooking.module/doctorPatientScheduleBooking/doctorPatientScheduleBooking.interface";
import { DoctorPatientScheduleBooking } from "../../scheduleAndAppointmentBooking.module/doctorPatientScheduleBooking/doctorPatientScheduleBooking.model";
import { TLabTestBookingStatus } from "../../scheduleAndAppointmentBooking.module/labTestBooking/labTestBooking.constant";
import { ILabTestBooking } from "../../scheduleAndAppointmentBooking.module/labTestBooking/labTestBooking.interface";
import { LabTestBooking } from "../../scheduleAndAppointmentBooking.module/labTestBooking/labTestBooking.model";
import { ISpecialistPatientScheduleBooking } from "../../scheduleAndAppointmentBooking.module/specialistPatientScheduleBooking/specialistPatientScheduleBooking.interface";
import { SpecialistPatientScheduleBooking } from "../../scheduleAndAppointmentBooking.module/specialistPatientScheduleBooking/specialistPatientScheduleBooking.model";
import { ISpecialistWorkoutClassSchedule } from "../../scheduleAndAppointmentBooking.module/specialistWorkoutClassSchedule/specialistWorkoutClassSchedule.interface";
import { IUser } from "../../token/token.interface";
import { ITrainingProgramPurchase } from "../../training.module/trainingProgramPurchase/trainingProgramPurchase.interface";
import { TrainingProgramPurchaseService } from "../../training.module/trainingProgramPurchase/trainingProgramPurchase.service";
import { TUser } from "../../user/user.interface";
import { User } from "../../user/user.model";
import { WalletService } from "../../wallet.module/wallet/wallet.service";
import { TPaymentGateway, TPaymentStatus, TTransactionFor } from "../paymentTransaction/paymentTransaction.constant";
import { PaymentTransaction } from "../paymentTransaction/paymentTransaction.model";
// ✅ Added imports for UserSubscription handling
import { UserSubscription } from "../../subscription.module/userSubscription/userSubscription.model";
import { UserSubscriptionStatusType } from "../../subscription.module/userSubscription/userSubscription.constant";
import stripe from "../../../config/stripe.config";
//@ts-ignore
import Stripe from "stripe";
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
//@ts-ignore
import mongoose from "mongoose";
import { TDoctorAppointmentScheduleStatus } from "../../scheduleAndAppointmentBooking.module/doctorAppointmentSchedule/doctorAppointmentSchedule.constant";

const trainingProgramPurchaseService = new TrainingProgramPurchaseService();
const walletService = new WalletService();

//------------------------------------------
// handle SERVICE BOOKING RELATED PAYMENTS
//------------------------------------------
export const handlePaymentSucceeded = async (session: Stripe.Checkout.Session) => {
     
     try {

          // console.log("session.metadata 🔎🔎", session.metadata)

          const { 
               referenceId, // bookingId
               user,
               referenceFor, // TTransactionFor .. bookingId related to which model
               currency,
               amount,
               referenceId2, // if more data is needed
               referenceFor2, // if more data is needed .. referenceId2 related to which model
               ...rest  // 👈 This captures everything else
          }: any = session.metadata;
          // userId // for sending notification .. 

          if(!session.metadata){
               return
          }

          let _user:IUser = JSON.parse(user);

          const thisCustomer = await User.findOne({ _id: _user.userId });

          if (!thisCustomer) {
               throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found');
          }

          // TODO : 🟢🟢
          // Based on referenceId and referenceFor .. we need to check
          // that Id exist or not in our database .. 

          const paymentIntent = session.payment_intent as string;
          // console.log('=============================');
          // console.log('paymentIntent : ', paymentIntent);

          const isPaymentExist = await PaymentTransaction.findOne({ paymentIntent });

          if (isPaymentExist) {
               throw new ApiError(StatusCodes.BAD_REQUEST, 'From Webhook handler : Payment Already exist');
          }

          // ✅ DEBUG: Log everything for troubleshooting
          console.log('🔍 handlePaymentSucceeded - referenceFor:', referenceFor, 'referenceId:', referenceId, 'session.subscription:', session.subscription);
          console.log('🔍 session.metadata:', JSON.stringify(session.metadata, null, 2));

          if(referenceFor === TTransactionFor.UserSubscription){
               console.log("🟢 Processing UserSubscription purchase from checkout.session.completed", {
                  referenceId,
                  subscriptionId: session.subscription,
                  userId: _user.userId
               });

               // Retrieve subscription from Stripe to get metadata and dates
               const subscriptionId = session.subscription as string;
               if (!subscriptionId) {
                  console.error('❌ No subscription ID in checkout session for UserSubscription');
                  return;
               }

               const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
                  expand: ['latest_invoice']
               });

               console.log('🔍 Stripe subscription.metadata:', JSON.stringify(subscription.metadata, null, 2));

               // ✅ FIX: Try session metadata first, then subscription metadata
               const metadata = subscription.metadata || session.metadata || {};
               if (!metadata.referenceId) {
                  console.error('❌ Missing referenceId in BOTH session and subscription metadata', {
                     sessionMetadata: session.metadata,
                     subscriptionMetadata: subscription.metadata
                  });
                  return;
               }

               // Calculate dates from Stripe
               const periodStart = subscription.latest_invoice?.period_start;
               const periodEnd = subscription.latest_invoice?.period_end;
               
               console.log('📅 Dates from Stripe:', { periodStart, periodEnd, periodStartDate: periodStart ? new Date(periodStart * 1000) : null, periodEndDate: periodEnd ? new Date(periodEnd * 1000) : null });

               const subscriptionStartDate = periodStart ? new Date(periodStart * 1000) : new Date();
               const currentPeriodStartDate = periodStart ? new Date(periodStart * 1000) : new Date();
               
               // ✅ FIX: Always add 1 month from periodStart for expiration
               // periodEnd might be same as periodStart for first billing cycle
               let expirationDate: Date;
               if (periodEnd && periodEnd > periodStart) {
                  expirationDate = new Date(periodEnd * 1000);
               } else {
                  expirationDate = new Date(subscriptionStartDate);
                  expirationDate.setMonth(expirationDate.getMonth() + 1);
               }

               console.log('📅 Calculated dates:', {
                  subscriptionStartDate,
                  currentPeriodStartDate,
                  expirationDate
               });

               // Validate dates
               if (isNaN(subscriptionStartDate.getTime()) || isNaN(currentPeriodStartDate.getTime()) || isNaN(expirationDate.getTime())) {
                  console.error('❌ Invalid dates in checkout.session.completed, using fallback');
                  const now = new Date();
                  const future30 = new Date();
                  future30.setMonth(future30.getMonth() + 1);
                  subscriptionStartDate.setTime(now.getTime());
                  currentPeriodStartDate.setTime(now.getTime());
                  expirationDate.setTime(future30.getTime());
               }

               // Create PaymentTransaction
               const newPayment = await PaymentTransaction.create({
                  userId: _user.userId,
                  referenceFor: metadata.referenceFor,
                  referenceId: metadata.referenceId,
                  paymentGateway: TPaymentGateway.stripe,
                  transactionId: session.id,
                  paymentIntent: paymentIntent,
                  amount: metadata.amount,
                  currency: metadata.currency,
                  paymentStatus: TPaymentStatus.completed,
                  gatewayResponse: session,
               });

               console.log('✅ PaymentTransaction created for UserSubscription:', newPayment._id);

               // Update UserSubscription from processing to active
               const userSubs = await UserSubscription.findByIdAndUpdate(metadata.referenceId, {
                  $set: {
                     stripe_subscription_id: subscriptionId,
                     stripe_transaction_id: paymentIntent,
                     subscriptionPlanId: metadata.subscriptionPlanId || null,
                     status: UserSubscriptionStatusType.active,
                     subscriptionStartDate,
                     currentPeriodStartDate,
                     expirationDate,
                     renewalDate: expirationDate,
                     billingCycle: 1,
                     isAutoRenewed: true,
                     cancelledAtPeriodEnd: false, // ✅ Ensure cancel flag is false for recurring subscription
                  }
               });

               // Update user's subscriptionType and mark free trial as used
               await User.findByIdAndUpdate(metadata.userId, {
                  $set: {
                     subscriptionType: metadata.subscriptionType,
                     hasUsedFreeTrial: true,
                  }
               });

               console.log('✅ UserSubscription activated and user updated:', {
                  userId: metadata.userId,
                  userSubscriptionId: metadata.referenceId,
                  subscriptionType: metadata.subscriptionType
               });

               // Send notification
               await enqueueWebNotification(
                  `New Subscription purchased by ${_user.userId} ${_user.userName} and paid ${metadata.amount} ${metadata.currency}`,
                  _user.userId,
                  null,
                  TRole.admin,
                  TNotificationType.payment,
                  null,
                  null
               );

               return; // Don't create duplicate payment transaction below
          }
          
          const newPayment = await PaymentTransaction.create({
               userId: _user.userId,
               referenceFor, // If this is for Order .. we pass "Order" here
               referenceId, // If this is for Order .. then we pass OrderId here
               paymentGateway: TPaymentGateway.stripe,
               transactionId: session.id,
               paymentIntent: paymentIntent,
               amount: amount,
               currency,
               paymentStatus: TPaymentStatus.completed,
               gatewayResponse: session,
          });

          let updatedObjectOfReferenceFor: any;
          if (referenceFor === TTransactionFor.Order) {
               updatedObjectOfReferenceFor = 
               updateOrderInformation(
                    _user,
                    referenceId, // orderId
                    newPayment._id, 
                    referenceId2, // cartId
                    referenceFor2 // Cart
               );
          } 
          // else if (referenceFor === TTransactionFor.SubscriptionPlan) {
          //       updatedObjectOfReferenceFor = updateUserSubscription(referenceId, newPayment._id);
          // }
          else if (referenceFor === TTransactionFor.LabTestBooking) {
               updatedObjectOfReferenceFor = updateLabTestBooking(_user, referenceId, newPayment._id);
          
          }else if (referenceFor === TTransactionFor.DoctorPatientScheduleBooking) {
               
               updatedObjectOfReferenceFor = 
               updateDoctorPatientScheduleBooking(thisCustomer, referenceId, newPayment._id, referenceId2, referenceFor2);
          }else if (referenceFor === TTransactionFor.TrainingProgramPurchase){
               updatedObjectOfReferenceFor =
               updatePurchaseTrainingProgram(
                    _user, referenceId, newPayment._id, referenceId2
               )
          }else if (referenceFor === TTransactionFor.SpecialistPatientScheduleBooking){
               updatedObjectOfReferenceFor =
               updateSpecialistPatientScheduleBooking(
                    thisCustomer,
                    referenceId, 
                    newPayment._id,
                    referenceId2,
                    referenceFor2
               )
          } else if (referenceFor === TTransactionFor.UserSubscription){
               console.log("Do we need to handle this ? 🤔🤔🤔 referenceFor === TTransactionFor.UserSubscription");
          }else{
               console.log(`🔎🔎🔎🔎🔎 May be we need to handle this  ${referenceFor} :: ${referenceId}`)
          }

          // if (!updatedObjectOfReferenceFor) {
          //      throw new ApiError(StatusCodes.NOT_FOUND, `In handlePaymentSucceeded Webhook Handler.. Booking not found 🚫 For '${referenceFor}': Id : ${referenceId}`);
          // }

          //---------------------------------
          // Notification Send korte hobe .. TODO :
          //---------------------------------

          return { payment: newPayment, paymentFor: updatedObjectOfReferenceFor };
     } catch (error) {
          console.error('Error in handlePaymentSucceeded:', error);
     }
};

async function updateOrderInformation(user: IUser,
     orderId: string,
     paymentTransactionId: string,
     cartId: string,
     cartIdReferenceFor: string
){

     // isBookingExists = await Order.findOne({ _id: orderId });

     const updatedOrder:IOrder = await Order.findByIdAndUpdate(orderId, { 
          /* update fields */ 
          paymentTransactionId : paymentTransactionId,
          paymentStatus: PaymentStatus.paid,
          status : OrderStatus.confirmed
     }, { new: true });

     //---------------------------------
     // Lets Delete Cart after order creation
     // TODO : Before delete .. we need to deduct the stock quantity of each product 
     //---------------------------------
     await Cart.findByIdAndUpdate(cartId, 
          {
               $set: { isDeleted: true } 
          }, 
          { new: true }
     );

     //---------------------------------
     // TODO : MUST Lets send notification to admin that a order is placed
     //---------------------------------
     await enqueueWebNotification(
          `A Patient ${user.userId} ${user.userName} placed new order, OrderId : ${orderId}, TxnId : ${paymentTransactionId} , amount : ${updatedOrder.finalAmount}`,
          user.userId, // senderId
          null, // receiverId 
          TRole.admin, // receiverRole
          TNotificationType.productOrder, // type
          //---------------------------------
          // In UI there is a details page for order in admin end 
          //---------------------------------
          '', // linkFor // TODO : MUST add the query params 
          orderId, // linkId
          // TTransactionFor.TrainingProgramPurchase, // referenceFor
          // purchaseTrainingProgram._id // referenceId
     );

     return updatedOrder;
}

async function updateLabTestBooking(
     user: IUser,
     labTestId: string,
     paymentTransactionId: string){

     // isBookingExists = await LabTestBooking.findOne({ _id: labTestId });

     const updatedLabTestBooking:ILabTestBooking = await LabTestBooking.findByIdAndUpdate(labTestId, { 
          /* update fields */ 
          paymentTransactionId : paymentTransactionId,
          paymentStatus: PaymentStatus.paid,
          status : TLabTestBookingStatus.confirmed
     }, { new: true });


     //---------------------------------
     // TODO : MUST
     // Lets send notification to admin that a lab test is booked
     //---------------------------------
     await enqueueWebNotification(
          `Lab Test ${updatedLabTestBooking.labTestId} booked by ${user.userName} . bookingId is ${updatedLabTestBooking._id}`,
          user.userId, // senderId
          null, // receiverId 
          TRole.admin, // receiverRole
          TNotificationType.labTestBooking, // type
          //---------------------------------
          // In UI there is no details page for specialist's schedule
          //---------------------------------
     );

     return updatedLabTestBooking;
}

//---------------------------------
// 🥇
//  const refModel = mongoose.model(result.type);
//  const isExistRefference = await refModel.findById(result.refferenceId).session(session);
//---------------------------------
async function updateDoctorPatientScheduleBooking(
     thisCustomer: TUser,
     doctorPatientScheduleBookingId: string,
     paymentTransactionId: string,
     doctorAppointmentScheduleId : string,
     doctorAppointmentScheduleIdReferenceFor: string
){
     // console.log("☑️HIT☑️ handlePaymentSucceed -> updateDoctorPatientScheduleBooking >>> doctorAppointmentScheduleId", doctorAppointmentScheduleId)

     const updatedDoctorPatientScheduleBooking:IDoctorPatientScheduleBooking = await DoctorPatientScheduleBooking.findByIdAndUpdate(doctorPatientScheduleBookingId, { 
          /* update fields */ 
          paymentTransactionId : paymentTransactionId,
          paymentStatus: PaymentStatus.paid,
          status : TAppointmentStatus.scheduled
     }, { new: true });

     const result:IDoctorAppointmentSchedule = await mongoose.model(doctorAppointmentScheduleIdReferenceFor).findByIdAndUpdate(
          doctorAppointmentScheduleId, 
          {
               /* update fields */
               booked_by: thisCustomer._id, // this is patientId
               scheduleStatus : TDoctorAppointmentScheduleStatus.booked,
          },
          { new: true }
     );

     // -------------------------------
     // add amount to specialist wallet
     // -------------------------------
     await walletService.addAmountToWalletAndCreateTransactionHistory(
          updatedDoctorPatientScheduleBooking.doctorId,
          updatedDoctorPatientScheduleBooking.price,
          paymentTransactionId, // for creating wallet transaction history
          `$${updatedDoctorPatientScheduleBooking.price} added to your wallet. Patient ${thisCustomer.name} booked a appointment and Doctor Patient Schedule Booking Id is ${doctorPatientScheduleBookingId} and txnId is ${paymentTransactionId}`, //description 
          TTransactionFor.DoctorPatientScheduleBooking, // referenceFor
          doctorPatientScheduleBookingId // referenceId
     );

     /********
      * Lets send notification to specialist that patient has booked workout class
      * 🎨 GUIDE FOR FRONTEND 
      *  |-> if doctor click on this notification .. redirect him to upcoming schedule... 
      * ***** */
     await enqueueWebNotification(
          `${result.scheduleName} purchased by a ${thisCustomer.subscriptionType} user ${thisCustomer.name} . appointmentBookingId ${updatedDoctorPatientScheduleBooking._id}`,
          thisCustomer._id, // senderId
          result.createdBy, // receiverId
          TRole.doctor, // receiverRole
          TNotificationType.appointmentBooking, // type
          // '', // linkFor
          // existingTrainingProgram._id // linkId
          // TTransactionFor.TrainingProgramPurchase, // referenceFor
          // purchaseTrainingProgram._id // referenceId
     );

     //---------------------------------
     // Now send notification to admin that patient has purchase and booked a workout class schedule
     //---------------------------------
     await enqueueWebNotification(
          `${result.scheduleName} Appointment Schedule of doctor ${updatedDoctorPatientScheduleBooking.doctorId} purchased by user ${thisCustomer.name}. appointmentBookingId ${updatedDoctorPatientScheduleBooking._id}`,
          user._id, // senderId
          null, // receiverId
          TRole.admin, // receiverRole
          TNotificationType.workoutClassPurchase, // type
          null, // linkFor
          null // linkId
     );

     return updatedDoctorPatientScheduleBooking;
}

async function updatePurchaseTrainingProgram(
     user: IUser,
     trainingProgramPurchaseId: string,
     paymentTransactionId: string,
     trainingProgramId: string
){
     const updatedTrainingProgramPurchase: ITrainingProgramPurchase = await mongoose.model(TTransactionFor.TrainingProgramPurchase).findByIdAndUpdate(
          trainingProgramPurchaseId, 
          {
               paymentTransactionId: paymentTransactionId,
               paymentStatus: PaymentStatus.paid,
               paymentMethod: PaymentMethod.online
          },
          { new: true }
     );

     // -------------------------------
     // add amount to specialist wallet
     // -------------------------------
     await walletService.addAmountToWalletAndCreateTransactionHistory(
          updatedTrainingProgramPurchase.specialistId,
          updatedTrainingProgramPurchase.price,
          paymentTransactionId, // for creating wallet transaction history
          `$${updatedTrainingProgramPurchase.price} added to your wallet. Patient ${user.userName} purchased a training program and Training Program Purchase Id is ${trainingProgramPurchaseId} and txnId is ${paymentTransactionId}`, //description 
          TTransactionFor.TrainingProgramPurchase, // referenceFor
          trainingProgramPurchaseId // referenceId
     );


     // console.log("♻️updatedTrainingProgramPurchase from webhook 🪝 🪝  ", updatedTrainingProgramPurchase)

     // here we create all patientTrainingSession for track all session for this patient
     trainingProgramPurchaseService._handlePersonTrainingSessionCreate(trainingProgramId, user);


     //---------------------------------
     // Lets send notification to specialist that patient has purchased training program
     //---------------------------------
     await enqueueWebNotification(
          `TrainingProgram ${trainingProgramId} purchased by a patient ${user.userName}`,
          user.userId, // senderId
          updatedTrainingProgramPurchase.specialistId, // receiverId
          TRole.specialist, // receiverRole
          TNotificationType.trainingProgramPurchase, // type
          'trainingProgramId', // linkFor
          trainingProgramId // linkId
     );


     //---------------------------------
     // Now send notification to admin that patient has purchased training program
     //---------------------------------
     await enqueueWebNotification(
          `${updatedTrainingProgramPurchase.trainingProgramId} Training Program of specialist ${updatedTrainingProgramPurchase.specialistId} purchased by user ${user.userName}. purchaseTrainingProgramId ${updatedTrainingProgramPurchase._id}`,
          user.userId, // senderId
          null, // receiverId
          TRole.admin, // receiverRole
          TNotificationType.trainingProgramPurchase, // type
          null, // linkFor
          null // linkId
     );


     //---------------------------------
     // Lets create wallet transaction history for this payment .. 
     // and update wallet balance
     //---------------------------------

     return updatedTrainingProgramPurchase;
}

async function updateSpecialistPatientScheduleBooking(
     user: TUser,
     specialistPatientScheduleBookingId: string,
     paymentTransactionId: string,
     specialistWorkoutClassScheduleId : string,
     specialistWorkoutClassScheduleIdReferenceFor: string
){
     // console.log("☑️HIT☑️ handlePaymentSucceed -> updateSpecialistPatientScheduleBooking >>> specialistPatientScheduleBookingId", specialistPatientScheduleBookingId)

     const updatedSpecialsitPatientWorkoutClassBooking:ISpecialistPatientScheduleBooking = await SpecialistPatientScheduleBooking.findByIdAndUpdate(specialistPatientScheduleBookingId, { 
          /* update fields */ 
          paymentTransactionId : paymentTransactionId,
          paymentStatus: PaymentStatus.paid,
          status : TAppointmentStatus.scheduled,
          paymentMethod: PaymentMethod.online
     }, { new: true });


     const specialistWorkoutClassSchedule: ISpecialistWorkoutClassSchedule = await mongoose.model(specialistWorkoutClassScheduleIdReferenceFor).findById(
          specialistWorkoutClassScheduleId
     );

     // -------------------------------
     // add amount to specialist wallet
     // -------------------------------
     await walletService.addAmountToWalletAndCreateTransactionHistory(
          updatedSpecialsitPatientWorkoutClassBooking.specialistId,
          updatedSpecialsitPatientWorkoutClassBooking.price,
          paymentTransactionId, // for creating wallet transaction history
          `$${updatedSpecialsitPatientWorkoutClassBooking.price} added to your wallet. Patient ${user.name} booked a ${specialistWorkoutClassSchedule.sessionType} workout class and Specialist Patient Schedule Booking Id is ${specialistPatientScheduleBookingId} and txnId is ${paymentTransactionId}`, //description 
          TTransactionFor.SpecialistPatientScheduleBooking, // referenceFor
          specialistPatientScheduleBookingId // referenceId
     );

     //---------------------------------
     // Lets send notification to specialist that patient has booked workout class
     //---------------------------------
     await enqueueWebNotification(
          `${specialistWorkoutClassSchedule.scheduleName} purchased by a ${user.subscriptionType} user ${user.name}`,
          user._id, // senderId
          updatedSpecialsitPatientWorkoutClassBooking.specialistId, // receiverId
          TRole.specialist, // receiverRole
          TNotificationType.workoutClassPurchase, // type
          //---------------------------------
          // In UI there is no details page for specialist's schedule
          //---------------------------------

          // '', // linkFor
          // existingWorkoutClass._id // linkId
     );

     //---------------------------------
     // Now send notification to admin that patient has purchase and booked a workout class schedule
     //---------------------------------
     await enqueueWebNotification(
          `${specialistWorkoutClassSchedule.scheduleName} Workout Class of specialist ${specialistWorkoutClassSchedule.createdBy} purchased by user ${user.name}. purchaseSpecialistWorkoutClassId ${updatedSpecialsitPatientWorkoutClassBooking._id}`,
          user._id, // senderId
          null, // receiverId
          TRole.admin, // receiverRole
          TNotificationType.workoutClassPurchase, // type
          null, // linkFor
          null // linkId
     );
  
     return updatedSpecialsitPatientWorkoutClassBooking;
}

