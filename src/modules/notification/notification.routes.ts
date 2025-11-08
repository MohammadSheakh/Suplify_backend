import { Router } from 'express';
import auth from '../../middlewares/auth';
import { NotificationController } from './notification.controllers';
import { TRole } from '../../middlewares/roles';

const router = Router();


router
  .route('/admin-notifications')
  .get(auth(TRole.admin), NotificationController.getAdminNotifications);
router
  .route('/')
  .get(auth(TRole.common), NotificationController.getALLNotification);


export const NotificationRoutes = router;
