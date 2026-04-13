//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
//@ts-ignore
import Stripe from 'stripe';
import { config } from '../../../config';
import stripe from '../../../config/stripe.config';
import { handlePaymentSucceeded } from './handlePaymentSucceeded';
import { handleFailedPayment } from './handleFailedPayment';
import { handleSubscriptionCancellation } from './handleSubscriptionCancellation';
import { handleSuccessfulPayment } from './handleSuccessfulPayment';
import { handleSubscriptionDates } from './handleSubscriptionDates';
import { handleTrialWillEnd } from './handleTrialWillEnd';

const webhookHandler = async (req: Request, res: Response): Promise<void> => {
     // console.log('Webhook received');
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

     // console.log('event.type', event.type);
     try {
          switch (event.type) {
               case 'checkout.session.completed': 
          
                    /***** //  ONE TIME PAYMENT
                     * 
                     * this is for ------ 
                     * Order
                     * LabTestBooking
                     * DoctorPatientScheduleBooking
                     * TrainingProgramPurchase
                     * SpecialistPatientScheduleBooking
                     * 
                     * ***** */
                    await handlePaymentSucceeded(event.data.object);
                    break;
               case 'payment_intent.payment_failed':
               case 'checkout.session.expired':
                    // Happens when the checkout session expires (user didn’t complete the payment).
                    console.log("🪝checkout.session.expired")
                    await handleFailedPayment(event.data.object);
                    break;
               //---------------------------------
               // TODO : later we will implement this 
               //---------------------------------  
               case 'transfer.created':
                    console.log("🪝transfer.created")
                    // await handleTransferCreated(event.data.object); // commented by sheakh
                    // console.log('🟢transfer.created🟢 Transfer created:', event.data.object);
                    break;
               // 🎯 AUTOMATIC BILLING AFTER TRIAL
               case 'invoice.payment_succeeded': // TODO :  we have to use  invoice.paid
                    console.log(`
                         ////////////////////////////////////////
                         🪝🪝invoice.payment_succeeded 🎯 userSubscription related
                         ////////////////////////////////////////
                    `)
               
                    /***
                     * here we create userSubscription
                     * Trial converted to paid / renewal succeeded
                     * *** */
                    await handleSuccessfulPayment(event.data.object as Stripe.Invoice);
                    break;
               // ✅ TRY TO GET ACURATE DATE FROM HERE ..  AFTER PAYMENT FOR SUBSCRIPTION
               case 'customer.subscription.created':
                    // ⚠️ SKIP: Dates now handled in checkout.session.completed (handlePaymentSucceeded)
                    // to avoid duplicate processing
                    console.log(`
                         ////////////////////////////////////////
                         🪝customer.subscription.created (skipped - handled in checkout.session.completed)
                         ////////////////////////////////////////
                    `)
                    break;
               case 'customer.subscription.trial_will_end':  
                    console.log("🪝customer.subscription.trial_will_end")
                    /*****
                     * 🔥🔥 event.type customer.subscription.trial_will_end
                     *   
                     * This event fires 3 days before the trial ends, giving you time to:

                         Notify the user
                         Handle potential payment failures
                         Provide last-chance offers
                    * 
                    * ****** */
                    await handleTrialWillEnd(event.data.object as Stripe.Subscription);
                    break;

               //  ❌ Payment failed 💳 PAYMENT FAILED AFTER TRIAL  
               case 'invoice.payment_failed':
                    console.log("🪝invoice.payment_failed")
                    await handleFailedPayment(event.data.object as Stripe.Invoice);
                    break;
               
                    // 🔄 SUBSCRIPTION CANCELLED
               case 'customer.subscription.deleted':
                    console.log('🪝customer.subscription.deleted')
                    await handleSubscriptionCancellation(event.data.object);
                    break;

               // ✅ TRIAL CONVERTED TO PAID
               case 'customer.subscription.updated':
                    console.log(`
                         ////////////////////////////////////////
                         🪝customer.subscription.updated
                         ////////////////////////////////////////
                    `)
                    // ⚠️ FIX: This event passes a Subscription object, not Invoice
                    // We should handle this differently or skip it to avoid errors
                    // console.log("⚠️ customer.subscription.updated - skipping, handled by invoice.payment_succeeded");
                    break;
               default:
                    // console.log(`Unhandled event type: ${event.type}`);
                    // console.log("🪝🪝unhandled🪝🪝", event.type)
                    break;
          }

          // Responding after handling the event
          res.status(200).json({ received: true });
     } catch (err: any) {
          console.error('❌❌Error handling the event:', err);
          res.status(500).send(`❌❌Internal Server Error: ${err.message}`);
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