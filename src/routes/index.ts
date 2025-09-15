//@ts-ignore
import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
// import { AdminRoutes } from '../modules/admin/admin.routes';
import { AttachmentRoutes } from '../modules/attachments/attachment.route';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { SettingsRoutes } from '../modules/settings/settings.routes';
import { TrainingProgramRoute } from '../modules/training.module/trainingProgram/trainingProgram.route';
import { ConversationRoute } from '../modules/chatting.module/conversation/conversation.route';
import { MessageRoute } from '../modules/chatting.module/message/message.route';
import { PaymentTransactionRoute } from '../modules/payment.module/paymentTransaction/paymentTransaction.route';
import stripeAccountRoutes from '../modules/payment.module/stripeAccount/stripeAccount.route';
import { ProductRoute } from '../modules/store.module/product/product.route';
import { CartItemRoute } from '../modules/order.module/cartItem/cartItem.route';
import { CartRoute } from '../modules/order.module/cart/cart.route';
import { OrderRoute } from '../modules/order.module/order/order.route';
import { DoctorAppointmentScheduleRoute } from '../modules/scheduleAndAppointmentBooking.module/doctorAppointmentSchedule/doctorAppointmentSchedule.route';
import { UserSubscriptionRoute } from '../modules/subscription.module/userSubscription/userSubscription.route';
import { SubscriptionPlanRoute } from '../modules/subscription.module/subscriptionPlan/subscriptionPlan.route';
import { TrainingSessionRoute } from '../modules/training.module/trainingSession/trainingSession.route';
import { SpecialistWorkoutClassScheduleRoute } from '../modules/scheduleAndAppointmentBooking.module/specialistWorkoutClassSchedule/specialistWorkoutClassSchedule.route';
import { informationVideoRoute } from '../modules/extra.module/informationVideo/informationVideo.route';
import { UserRoutes } from '../modules/user/user.route';
import { DoctorPatientScheduleBookingRoute } from '../modules/scheduleAndAppointmentBooking.module/doctorPatientScheduleBooking/doctorPatientScheduleBooking.route';
import { doctorPatientRoute } from '../modules/personRelationships.module/doctorPatient/doctorPatient.route';
import { specialistPatientRoute } from '../modules/personRelationships.module/specialistPatient/specialistPatient.route';
import { TrainingProgramPurchaseRoute } from '../modules/training.module/trainingProgramPurchase/trainingProgramPurchase.route';
import { DoctorPlanRoute } from '../modules/protocol.module/doctorPlan/doctorPlan.route';
import { protocolRoute } from '../modules/protocol.module/protocol/protocol.route';

// import { ChatRoutes } from '../modules/chat/chat.routes';
// import { MessageRoutes } from '../modules/message/message.routes';
const router = express.Router();

const apiRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: UserRoutes,
  },
  // {
  //   path: '/admin',
  //   route: AdminRoutes,
  // },

  ////////////////////// Created By Mohammad Sheakh

  {
    path: '/settings',
    route: SettingsRoutes,
  },
  {
    path: '/products',
    route: ProductRoute,
  },
  ///////////////////////////////////////// Training Program
  { // 🟢
    path: '/training-programs',
    route: TrainingProgramRoute,
  },
  { // 🟢
    path: '/training-sessions',
    route: TrainingSessionRoute,
  },
  { // 🟢
    path: '/training-programs/purchase',
    route: TrainingProgramPurchaseRoute,
  },
  //////////////////////////////////////////// Cart Order
  { // 🟢
    path: '/cart-items',
    route: CartItemRoute,
  },
  { // 🟢
    path: '/carts',
    route: CartRoute,
  },
   { // 🟢
    path: '/orders',
    route: OrderRoute,
  },
  ///////////////////////////////////////// Chatting 
  { // 🟢
    path: '/conversations',
    route: ConversationRoute,
  },
  { // 🟢
    path: '/information-videos',
    route: informationVideoRoute,
  },
  ////////////////////////////////////////////  Doctor Appointment
  { // 🟢
    path: '/doctor-appointments',
    route: DoctorAppointmentScheduleRoute,
  },
  
  { // 🟢
    path: '/doctor-appointments/bookings',
    route: DoctorPatientScheduleBookingRoute,
  },
  //////////////////////////////////////////// Doctor Plan (protocol)
  { // 🟢
    path: '/doctor-plans/',
    route: DoctorPlanRoute,
  },
  { // 🟢
    path: '/protocols/',
    route: protocolRoute,
  },

  ///////////////////////////////////////////// Person Relationships
  { // 🟢
    path: '/doctor-patients',
    route: doctorPatientRoute,
  },
  { // 🟢
    path: '/specialist-patients',
    route: specialistPatientRoute,
  },
  ///////////////////////////////////////////// Workout Class
  { // 🟢
    path: '/workout-schedules',
    route: SpecialistWorkoutClassScheduleRoute,
  },
  {
    path: '/attachments',
    route: AttachmentRoutes,
  },
  {
    path: '/activitys',
    route: NotificationRoutes,
  },
  {
    path: '/messages',
    route: MessageRoute,
  },
  {
    path: '/payments',
    route: PaymentTransactionRoute,
  },
  {
    path: '/user-subs',
    route: UserSubscriptionRoute,
  },
  //////////////////////////////////////// Subscription
  { // 🟢
    path: '/subscription-plans',
    route: SubscriptionPlanRoute,
  },
  {  // 🟢 from kappes
    path: '/stripe',
    route: stripeAccountRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
