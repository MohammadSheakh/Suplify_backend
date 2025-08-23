import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
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
    path: '/product',
    route: ProductRoute,
  },
  {
    path: '/trainingProgram',
    route: TrainingProgramRoute,
  },
  // {
  //   path: '/subscription',
  //   route: SubscriptionRoute,
  // },
  {
    path: '/conversation',
    route: ConversationRoute,
  },

  {
    path: '/attachment',
    route: AttachmentRoutes,
  },
  {
    path: '/activity',
    route: NotificationRoutes,
  },
  {
    path: '/message',
    route: MessageRoute,
  },
  {
    path: '/paymentTransaction',
    route: PaymentTransactionRoute,
  },
  {
    path: '/stripe',
    route: stripeAccountRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
