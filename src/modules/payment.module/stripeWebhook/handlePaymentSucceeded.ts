import ApiError from "../../../errors/ApiError";
import { TRole } from "../../../middlewares/roles";
import { sendInWebNotification } from "../../../services/notification.service";
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
import { TPaymentGateway, TPaymentStatus, TTransactionFor } from "../paymentTransaction/paymentTransaction.constant";
import { PaymentTransaction } from "../paymentTransaction/paymentTransaction.model";
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
//@ts-ignore
import mongoose from "mongoose";

const trainingProgramPurchaseService = new TrainingProgramPurchaseService();

// Function for handling a successful payment
export const handlePaymentSucceeded = async (session: Stripe.Checkout.Session) => {
     
     try {
          const { 
               referenceId,
               user,
               referenceFor,
               currency,
               amount,
               referenceId2,
               referenceFor2
          }: any = session.metadata;
          // userId // for sending notification .. 

          let _user:IUser = JSON.parse(user);

          const thisCustomer = await User.findOne({ _id: _user.userId });

          if (!thisCustomer) {
               throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found');
          }

          // TODO : 🟢🟢
          // Based on referenceId and referenceFor .. we need to check
          // that Id exist or not in our database .. 

          const paymentIntent = session.payment_intent as string;
          console.log('=============================');
          console.log('paymentIntent : ', paymentIntent);
          
          const isPaymentExist = await PaymentTransaction.findOne({ paymentIntent });

          if (isPaymentExist) {
               throw new ApiError(StatusCodes.BAD_REQUEST, 'From Webhook handler : Payment Already exist');
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
                    referenceId,
                    newPayment._id,
                    referenceId2,
                    referenceFor2
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
          }

          if (!updatedObjectOfReferenceFor) {
               throw new ApiError(StatusCodes.NOT_FOUND, `In handlePaymentSucceeded Webhook Handler.. Booking not found 🚫 For '${referenceFor}': Id : ${referenceId}`);
          }

          /******
           * 
           * Notification Send korte hobe .. TODO :
           * 
           * ***** */

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

     /******
      * Lets Delete Cart after order creation
      * ***** */
     await Cart.findByIdAndUpdate(cartId, 
          {
               $set: { isDeleted: true } 
          }, 
          { new: true }
     );

     /********
     * TODO : MUST
     * Lets send notification to admin that a order is placed
     * ***** */
     await sendInWebNotification(
          `A Patient ${user.userId} ${user.userName} placed new order, OrderId : ${orderId}, TxnId : ${paymentTransactionId} , amount : ${updatedOrder.finalAmount}`,
          user.userId, // senderId
          null, // receiverId 
          TRole.admin, // receiverRole
          TNotificationType.productOrder, // type
          /**********
           * In UI there is a details page for order in admin end 
           * **** */
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


     /********
     * TODO : MUST
     * Lets send notification to admin that a lab test is booked
     * ***** */
     await sendInWebNotification(
          `Lab Test ${updatedLabTestBooking.labTestId} booked by ${user.userName} . bookingId is ${updatedLabTestBooking._id}`,
          user.userId, // senderId
          null, // receiverId 
          TRole.admin, // receiverRole
          TNotificationType.labTestBooking, // type
          /**********
           * In UI there is no details page for specialist's schedule
           * **** */
     );

     return updatedLabTestBooking;
}

/**********
*  const refModel = mongoose.model(result.type);
*  const isExistRefference = await refModel.findById(result.refferenceId).session(session);
* ********** */
async function updateDoctorPatientScheduleBooking(
     thisCustomer: TUser,
     doctorPatientScheduleBookingId: string,
     paymentTransactionId: string,
     doctorAppointmentScheduleId : string,
     doctorAppointmentScheduleIdReferenceFor: string
){
     console.log("☑️HIT☑️ handlePaymentSucceed -> updateDoctorPatientScheduleBooking >>> doctorAppointmentScheduleId", doctorAppointmentScheduleId)

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
          },
          { new: true }
     );

     /********
      * Lets send notification to specialist that patient has booked workout class
      * 🎨 GUIDE FOR FRONTEND 
      *  |-> if doctor click on this notification .. redirect him to upcoming schedule... 
      * ***** */
     await sendInWebNotification(
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

     /**********
      * Now send notification to admin that patient has purchase and booked a workout class schedule
      * ******* */
     await sendInWebNotification(
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
               PaymentMethod: PaymentMethod.online
          },
          { new: true }
     );


     console.log("♻️updatedTrainingProgramPurchase from webhook 🪝 🪝  ", updatedTrainingProgramPurchase)

     // here we create all patientTrainingSession for track all session for this patient
     trainingProgramPurchaseService._handlePersonTrainingSessionCreate(trainingProgramId, user);


     /********
      * Lets send notification to specialist that patient has purchased training program
      * ***** */
     await sendInWebNotification(
          `TrainingProgram ${trainingProgramId} purchased by a patient ${user.userName}`,
          user.userId, // senderId
          updatedTrainingProgramPurchase.specialistId, // receiverId
          TRole.specialist, // receiverRole
          TNotificationType.trainingProgramPurchase, // type
          'trainingProgramId', // linkFor
          trainingProgramId // linkId
     );


     /**********
      * Now send notification to admin that patient has purchased training program
      * ******* */
     await sendInWebNotification(
          `${updatedTrainingProgramPurchase.trainingProgramId} Training Program of specialist ${updatedTrainingProgramPurchase.specialistId} purchased by user ${user.userName}. purchaseTrainingProgramId ${updatedTrainingProgramPurchase._id}`,
          user.userId, // senderId
          null, // receiverId
          TRole.admin, // receiverRole
          TNotificationType.trainingProgramPurchase, // type
          null, // linkFor
          null // linkId
     );


     /******
      * 
      * Lets create wallet transaction history for this payment .. 
      * and update wallet balance
      * ****** */


     return updatedTrainingProgramPurchase;
}


async function updateSpecialistPatientScheduleBooking(
     user: TUser,
     specialistPatientScheduleBookingId: string,
     paymentTransactionId: string,
     specialistWorkoutClassScheduleId : string,
     specialistWorkoutClassScheduleIdReferenceFor: string
){
     console.log("☑️HIT☑️ handlePaymentSucceed -> updateSpecialistPatientScheduleBooking >>> specialistPatientScheduleBookingId", specialistPatientScheduleBookingId)

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


     /********
      * Lets send notification to specialist that patient has booked workout class
      * ***** */
     await sendInWebNotification(
          `${specialistWorkoutClassSchedule.scheduleName} purchased by a ${user.subscriptionType} user ${user.name}`,
          user._id, // senderId
          updatedSpecialsitPatientWorkoutClassBooking.specialistId, // receiverId
          TRole.specialist, // receiverRole
          TNotificationType.workoutClassPurchase, // type
          /**********
           * In UI there is no details page for specialist's schedule
           * **** */
          // '', // linkFor
          // existingWorkoutClass._id // linkId
     );

     /**********
      * Now send notification to admin that patient has purchase and booked a workout class schedule
      * ******* */
     await sendInWebNotification(
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

