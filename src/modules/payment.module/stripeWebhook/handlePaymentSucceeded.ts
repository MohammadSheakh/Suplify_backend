import ApiError from "../../../errors/ApiError";
import { OrderStatus, PaymentStatus } from "../../order.module/order/order.constant";
import { Order } from "../../order.module/order/order.model";
import { DoctorAppointmentSchedule } from "../../scheduleAndAppointmentBooking.module/doctorAppointmentSchedule/doctorAppointmentSchedule.model";
import { TAppointmentStatus } from "../../scheduleAndAppointmentBooking.module/doctorPatientScheduleBooking/doctorPatientScheduleBooking.constant";
import { DoctorPatientScheduleBooking } from "../../scheduleAndAppointmentBooking.module/doctorPatientScheduleBooking/doctorPatientScheduleBooking.model";
import { TLabTestBookingStatus } from "../../scheduleAndAppointmentBooking.module/labTestBooking/labTestBooking.constant";
import { LabTestBooking } from "../../scheduleAndAppointmentBooking.module/labTestBooking/labTestBooking.model";
import { IUser } from "../../token/token.interface";
import { TrainingProgramPurchase } from "../../training.module/trainingProgramPurchase/trainingProgramPurchase.model";
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
     // console.log('handlePaymentSucceeded called with session: 🟢🟢', session);
     try {
          const { referenceId, user, referenceFor, currency,  amount,  referenceId2, referenceFor2 }: any = session.metadata;
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
               updatedObjectOfReferenceFor = updateOrderInformation(referenceId, newPayment._id);
          } 
          // else if (referenceFor === TTransactionFor.SubscriptionPlan) {
          //       updatedObjectOfReferenceFor = updateUserSubscription(referenceId, newPayment._id);
          // }
          else if (referenceFor === TTransactionFor.LabTestBooking) {
               updatedObjectOfReferenceFor = updateLabTestBooking(referenceId, newPayment._id);
          
          }else if (referenceFor === TTransactionFor.DoctorPatientScheduleBooking) {
               updatedObjectOfReferenceFor = 
               updateDoctorPatientScheduleBooking(thisCustomer, referenceId, newPayment._id, referenceId2, referenceFor2);
          }else if (referenceFor === TTransactionFor.TrainingProgramPurchase){
               updatedObjectOfReferenceFor =
               updatePurchaseTrainingProgram(
                    thisCustomer, referenceId, newPayment._id,
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

async function updateOrderInformation(orderId: string, paymentTransactionId: string){

     // isBookingExists = await Order.findOne({ _id: orderId });

     const updatedOrder = await Order.findByIdAndUpdate(orderId, { 
          /* update fields */ 
          paymentTransactionId : paymentTransactionId,
          paymentStatus: PaymentStatus.paid,
          status : OrderStatus.confirmed
     }, { new: true });

     return updatedOrder;
}

async function updateLabTestBooking(labTestId: string, paymentTransactionId: string){

     // isBookingExists = await LabTestBooking.findOne({ _id: labTestId });

     const updatedLabTestBooking = await LabTestBooking.findByIdAndUpdate(labTestId, { 
          /* update fields */ 
          paymentTransactionId : paymentTransactionId,
          paymentStatus: PaymentStatus.paid,
          status : TLabTestBookingStatus.confirmed
     }, { new: true });

     return updatedLabTestBooking;
}

/**********
* 
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

     const updatedDoctorPatientScheduleBooking = await DoctorPatientScheduleBooking.findByIdAndUpdate(doctorPatientScheduleBookingId, { 
          /* update fields */ 
          paymentTransactionId : paymentTransactionId,
          paymentStatus: PaymentStatus.paid,
          status : TAppointmentStatus.scheduled
     }, { new: true });

     const result = await mongoose.model(doctorAppointmentScheduleIdReferenceFor).findByIdAndUpdate(
          doctorAppointmentScheduleId, 
          {
               /* update fields */
               booked_by: thisCustomer._id, // this is patientId
          },
          { new: true }
     );

     console.log("result ::::", result)

     // await DoctorAppointmentSchedule.findByIdAndUpdate(
     //      doctorAppointmentScheduleId, 
     //      {
     //           /* update fields */
     //           booked_by: thisCustomer._id, // this is patientId
     //      },
     //      { new: true }
     // );

     return updatedDoctorPatientScheduleBooking;
}


async function updatePurchaseTrainingProgram(
     thisCustomer: TUser,
     trainingProgramPurchaseId: string,
     paymentTransactionId: string,
){
     console.log(`
          ☑️HIT☑️ handlePaymentSucceed ->
          updatePurchaseTrainingProgram >>>
          trainingProgramPurchaseId" :::: ${trainingProgramPurchaseId}`)

     const purchasedTrainingProgram = await TrainingProgramPurchase.findById(trainingProgramPurchaseId);

     const updatedTrainingProgramPurchase = await mongoose.model(TTransactionFor.TrainingProgramPurchase).findByIdAndUpdate(
          trainingProgramPurchaseId, 
          {
               paymentTransactionId: paymentTransactionId,
               paymentStatus: PaymentStatus.paid
          },
          { new: true }
     );

     // here we create all patientTrainingSession for track all session for this patient
     trainingProgramPurchaseService._handlePersonTrainingSessionCreate(trainingProgramPurchaseId);

     return updatedTrainingProgramPurchase;
}
