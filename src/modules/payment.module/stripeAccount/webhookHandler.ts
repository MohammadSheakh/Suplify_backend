/************
 * 
 *  Working ... Sheakh
 * 
 * ********** */
/*
import { emailHelper } from '../../../helpers/emailHelper';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { generateBookingInvoicePDF } from '../../../utils/generateOrderInvoicePDF';
*/

/*
import { BOOKING_STATUS, PaymentStatus } from '../booking/booking.enums';
import { BID_STATUS } from '../Bid/Bid.enum';
import { NOTIFICATION_MODEL_TYPE, NotificationTitle } from '../notification/notification.enum';

import { PaymentService } from '../Payment/Payment.service';
*/

/*
import { Booking } from '../booking/booking.model';
import { Payment } from '../Payment/Payment.model';
import { Bid } from '../Bid/Bid.model';
import { Service } from '../Service/Service.model';
import { User } from '../user/user.model';
*/
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import { config } from '../../../config';
import stripe from '../../../config/stripe.config';
import { User } from '../../user/user.model';
import ApiError from '../../../errors/ApiError';



const webhookHandler = async (req: Request, res: Response): Promise<void> => {
     console.log('Webhook received');
     const sig = req.headers['stripe-signature'];
     const webhookSecret = config.stripe.webhookSecret;

     if (!webhookSecret) {
          console.error('Stripe webhook secret not set');
          res.status(500).send('Webhook secret not configured');
          return;
     }

     let event: Stripe.Event;

     try {
          event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
     } catch (err: any) {
          console.error('Webhook signature verification failed:', err.message);
          res.status(400).send(`Webhook Error: ${err.message}`);
          return;
     }

     console.log('event.type', event.type);
     try {
          switch (event.type) {
               case 'checkout.session.completed':
                    // await handlePaymentSucceeded(event.data.object); // commented by sheakh
                    console.log('sheakh Payment succeeded:', event.data.object);
                    break;
               case 'transfer.created':
                    // await handleTransferCreated(event.data.object); // commented by sheakh
                    console.log('sheakh Transfer created:', event.data.object);
                    break;
               default:
                    console.log(`Unhandled event type: ${event.type}`);
                    break;
          }

          // Responding after handling the event
          res.status(200).json({ received: true });
     } catch (err: any) {
          console.error('Error handling the event:', err);
          res.status(500).send(`Internal Server Error: ${err.message}`);
     }
};

export default webhookHandler;

// Function for handling a successful payment
const handlePaymentSucceeded = async (session: Stripe.Checkout.Session) => {
     try {
          const { acceptedBid, user, booking, serviceCategory, method, amount, notificationReceivers, isAcceptedBidChanged, previouslyAcceptedBidProvider }: any = session.metadata;

          const thisCustomer = await User.findOne({ _id: user });
          // Parsing the 'notificationReceivers' metadata, as it was previously stringified before sending to Stripe
          const notificationReceiversParsed = JSON.parse(notificationReceivers);
          const paymentIntent = session.payment_intent as string;
          console.log('=============================');
          console.log('paymentIntent : 2', paymentIntent);
          const isPaymentExist = await PaymentService.isPaymentExist(paymentIntent);
          if (isPaymentExist) {
               throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment Already exist');
          }
          const isBookingExists = await Booking.findById(booking);
          if (!isBookingExists) {
               throw new ApiError(StatusCodes.BAD_REQUEST, 'Booking not found');
          }
          const thisAcceptedBid = await Bid.findOne({ _id: acceptedBid });
          if (!thisAcceptedBid) {
               throw new ApiError(StatusCodes.BAD_REQUEST, 'Accepted bid not found');
          }
          console.log('isPaymentExist : 3');
          const newPayment = await PaymentService.createPayment({
               user: thisCustomer!._id,
               booking: booking,
               serviceCategory: serviceCategory,
               method: method,
               status: PaymentStatus.PAID,
               transactionId: session.id,
               paymentIntent: paymentIntent,
               amount: amount,
               gatewayResponse: session,
          });
          isBookingExists.payment = newPayment._id;
          isBookingExists.acceptedBid = thisAcceptedBid._id;
          isBookingExists.adminRevenuePercent = (thisAcceptedBid.serviceProvider as any)?.adminRevenuePercent;
          isBookingExists.serviceProvider = (thisAcceptedBid.serviceProvider as any)._id;
          isBookingExists.status = BOOKING_STATUS.CONFIRMED;
          await isBookingExists.validate();
          isBookingExists.finalAmount = amount;
          isBookingExists.paymentStatus = PaymentStatus.PAID;
          await isBookingExists.save();



          // Update the bid status to accepted
          thisAcceptedBid.isAccepted = true;
          thisAcceptedBid.status = BID_STATUS.ACCEPTED;
          thisAcceptedBid.booking = isBookingExists._id;
          await thisAcceptedBid.save();
          console.log('thisAcceptedBid : 11', thisAcceptedBid);

          // Update all other bids to rejected
          await Bid.updateMany({ _id: { $ne: thisAcceptedBid._id }, booking: isBookingExists._id }, { $set: { isAccepted: false, status: BID_STATUS.REJECTED } });

          console.log('newPayment : 11');

          let notificationTitle = '';
          if (!isAcceptedBidChanged) {
               // increase the purchase count of the all the proudcts use operatros
               const updateServedCount = await Service.updateMany({ _id: { $in: isBookingExists.services.map((item: any) => item.service) } }, { $inc: { servedCount: 1 } });
               notificationTitle = `New order placed by ${thisCustomer?.full_name} Accepting Bid.`;
          } else {
               notificationTitle = `Booking bid changed by ${thisCustomer?.full_name}. New service provider assigned.`;
               if (previouslyAcceptedBidProvider) {
                    await sendNotifications({
                         receiver: previouslyAcceptedBidProvider,
                         type: NOTIFICATION_MODEL_TYPE.BOOKING,
                         title: NotificationTitle.BID_CHANGED,
                         message: `Your accepted bid for booking ${booking._id} has been cancelled by the customer ${thisCustomer?.full_name}.`,
                         reference: booking,
                    });
               }
          }

          // send email to user, notification to bidders and admins socket
          for (const receiverId of notificationReceiversParsed) {
               await sendNotifications({
                    receiver: receiverId,
                    type: NOTIFICATION_MODEL_TYPE.BOOKING,
                    title: NotificationTitle.NEW_BOOKING,
                    message: `New order placed by  ${thisCustomer?.full_name}. But pending for accepted bid. booking id : ${isBookingExists._id}`,
                    reference: isBookingExists._id,
               });
          }

          // Generate PDF invoice
          const pdfBuffer = await generateBookingInvoicePDF(isBookingExists);

          // Prepare email with PDF attachment
          const values = {
               name: thisCustomer?.full_name!,
               email: thisCustomer?.email!,
               booking: isBookingExists,
               attachments: [
                    {
                         filename: `invoice-${isBookingExists._id}.pdf`,
                         content: pdfBuffer,
                         contentType: 'application/pdf',
                    },
               ],
          };

          // Send email with invoice attachment
          const emailTemplateData = emailTemplate.bookingInvoice(values);
          emailHelper.sendEmail({
               ...emailTemplateData,
               attachments: values.attachments,
          });
          return { payment: newPayment, booking: isBookingExists };
     } catch (error) {
          console.error('Error in handlePaymentSucceeded:', error);
     }
};

// handleTransferCreated
const handleTransferCreated = async (transfer: Stripe.Transfer) => {
     try {
          console.log(`Transfer for user ${transfer.destination} created`);

          // Get order and shop details from transfer metadata
          const booking = await Booking.findById(transfer.metadata?.bookingId);
          if (!booking) {
               throw new ApiError(StatusCodes.BAD_REQUEST, 'Booking not found');
          }
          // update isTransferd true
          booking.isPaymentTransferd = true;
          booking.paymentStatus = PaymentStatus.PAID;
          booking.status = BOOKING_STATUS.COMPLETED;
          await booking.save();

          // get isExistPayment
          const isExistPayment = await Payment.findOne({ booking: booking._id, method: booking.paymentMethod });
          if (!isExistPayment) {
               throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment not found');
          }
          isExistPayment.status = PaymentStatus.PAID;
          await isExistPayment.save();
     } catch (error) {
          console.error('Error in handleTransferCreated:', error);
     }
};
