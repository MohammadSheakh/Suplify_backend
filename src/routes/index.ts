//@ts-ignore Test 
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
import { PlanByDoctorRoute } from '../modules/protocol.module/planByDoctor/planByDoctor.route';
import { SuggestionBySpecialistRoute } from '../modules/protocol.module/suggestionBySpecialist/suggestionBySpecialist.route';
import { SpecialistPatientScheduleBookingRoute } from '../modules/scheduleAndAppointmentBooking.module/specialistPatientScheduleBooking/specialistPatientScheduleBooking.route';
import { DoctorSpecialistPatientRoute } from '../modules/personRelationships.module/doctorSpecialistPatient/doctorSpecialistPatient.route';
import { OrderItemRoute } from '../modules/order.module/orderItem/orderItem.route';
import { SuccessTrackerRoute } from '../modules/successTracker.module/successTracker/successTracker.route';
import { WalletTransactionHistoryRoute } from '../modules/wallet.module/walletTransactionHistory/walletTransactionHistory.route';
import { BankInfoRoute } from '../modules/wallet.module/bankInfo/bankInfo.route';
import { WithdrawalRequstRoute } from '../modules/wallet.module/withdrawalRequst/withdrawalRequst.route';
import { LabTestBookingRoute } from '../modules/scheduleAndAppointmentBooking.module/labTestBooking/labTestBooking.route';
import { PatientTrainingSessionRoute } from '../modules/training.module/patientTrainingSession/patientTrainingSession.route';
import { SpecialistSuggestionForAPlanRoute } from '../modules/protocol.module/specialistSuggestionForAPlan/specialistSuggestionForAPlan.route';
import { SuplifyHotspotRoute } from '../modules/suplifyHotspot/suplifyHotspot.route';
import { HireSpecialistRequestToAdminRoute } from '../modules/personRelationships.module/hireSpecialistRequestToAdmin/hireSpecialistRequestToAdmin.route';
import { RequestForViseSubscriptionToAdminRoute } from '../modules/personRelationships.module/requestForViseSubscriptionToAdmin/requestForViseSubscriptionToAdmin.route';
import { QuestionRoute } from '../modules/question.module/question/question.route';
import { AnswerChoiceRoute } from '../modules/question.module/answerChoice/answerChoice.route';
import { AssessmentRoute } from '../modules/question.module/assessment/assessment.route';
import { AssessmentAnswerRoute } from '../modules/question.module/assessmentAnswer/assessmentAnswer.route';

// import { ChatRoutes } from '../modules/chat/chat.routes';
// import { MessageRoutes } from '../modules/message/message.routes';
const router = express.Router();

const apiRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  // {
  //   path: '/admin',
  //   route: AdminRoutes,
  // },

  ////////////////////// Created By Mohammad Sheakh


  //------------------------------- Conversation
  {
    path: '/messages',
    route: MessageRoute,
  },

  {
    path: '/conversations',
    route: ConversationRoute,
  },
  //----------------------------------------
  {
    path: '/settings',
    route: SettingsRoutes,
  },
  {
    path: '/products',
    route: ProductRoute,
  },
  //---------------------------------------- Success Tracker
  {
    path: '/success-tracker',
    route: SuccessTrackerRoute,
  },
  
  //---------------------------------------- Training Program
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
  { // 🟢
    path: '/patient-session',
    route: PatientTrainingSessionRoute,
  },
  //---------------------------------------- Cart Order
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

  { // 🟢
    path: '/order-items',
    route: OrderItemRoute,
  },

  { // 🟢
    path: '/labTest-bookings',
    route: LabTestBookingRoute,
  },

  //---------------------------------------- Payment Transaction
  { // 🟢
    path: '/payment-transactions',
    route: PaymentTransactionRoute,
  },

  //---------------------------------------- Chatting 
  { // 🟢
    path: '/conversations',
    route: ConversationRoute,
  },
  { // 🟢
    path: '/information-videos',
    route: informationVideoRoute,
  },
  //----------------------------------------  Doctor Appointment
  { // 🟢
    path: '/doctor-appointments',
    route: DoctorAppointmentScheduleRoute,
  },
  
  { // 🟢
    path: '/doctor-appointments/bookings',
    route: DoctorPatientScheduleBookingRoute,
  },

  //----------------------------------------  Questions
  { // 🟢 //-------------- admin create question with answer-choices
    path: '/questions',
    route: QuestionRoute,
  },
  { // 🟢
    path: '/answer-choices',
    route: AnswerChoiceRoute,
  },
  { // 🟢 --------------------- if a person submit answer we create a assessment document for him
    path: '/assessment-answers',
    route: AssessmentAnswerRoute,
  },

  //---------------------------------------- Doctor Plan (protocol)
  
  { // 🟢
    path: '/doctor-plans/',
    route: DoctorPlanRoute,
  },
  { // 🟢
    path: '/protocols/',
    route: protocolRoute,
  },
  { // 🟢
    path: '/plan-by-doc/',
    route: PlanByDoctorRoute,
  },

  { // 🟢
    path: '/suggestion-by-specialist/',
    route: SuggestionBySpecialistRoute,
  },

  { // 🟢
    path: '/suggestion-by-specialist-for-a-plan/',
    route: SpecialistSuggestionForAPlanRoute,
  },

  { // 🟢
    path: '/doctor-specialist-patient-relation/',
    route: DoctorSpecialistPatientRoute,
  },

  //---------------------------------------- Person Relationships
  { // 🟢
    path: '/doctor-patients',
    route: doctorPatientRoute,
  },
  { // 🟢
    path: '/specialist-patients',
    route: specialistPatientRoute,
  },

  //---------------------------------------- Request For Vise Subscription 🆕
  { // 🟢
    path: '/vise-subscription-request',
    route: RequestForViseSubscriptionToAdminRoute,
  },
  //---------------------------------------- Hire Specialist 🆕
  { // 🟢
    path: '/hire-specialist',
    route: HireSpecialistRequestToAdminRoute,
  },

  //---------------------------------------- Workout Class
  { // 🟢
    path: '/workout-schedules',
    route: SpecialistWorkoutClassScheduleRoute,
  },
  { // 🟢
    path: '/workout-schedules/bookings',
    route: SpecialistPatientScheduleBookingRoute,
  },
  {
    path: '/attachments',
    route: AttachmentRoutes,
  },
  {
    path: '/notifications',
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
  //---------------------------------------- Subscription
  { // 🟢
    path: '/subscription-plans',
    route: SubscriptionPlanRoute,
  },
  {  // 🟢 from kappes
    path: '/stripe',
    route: stripeAccountRoutes,
  },
  //---------------------------------------- Wallet
  { // 🟢
    path: '/wallet-transactions',
    route: WalletTransactionHistoryRoute,
  },
  { // 🟢
    path: '/withdrawal-requst',
    route: WithdrawalRequstRoute,
  },
  { // 🟢
    path: '/bank-info',
    route: BankInfoRoute,
  },

  //---------------------------------------- Suplify Hotspot 🆕
  { // 🟢
    path: '/hotspot',
    route: SuplifyHotspotRoute,
  },

  
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
