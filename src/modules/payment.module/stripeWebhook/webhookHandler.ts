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

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import { config } from '../../../config';
import stripe from '../../../config/stripe.config';
import { User } from '../../user/user.model';
import ApiError from '../../../errors/ApiError';
import { handlePaymentSucceeded } from './handlePaymentSucceeded';

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
                    console.log('🟢🟢', event.data.object);
                    await handlePaymentSucceeded(event.data.object);
                    break;
               case 'transfer.created':
                    // await handleTransferCreated(event.data.object); // commented by sheakh
                    console.log('🟢🟢 Transfer created:', event.data.object);
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



/***************
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
*********** */