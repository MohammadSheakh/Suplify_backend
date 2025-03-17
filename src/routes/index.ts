import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';

import { ProjectRoutes } from '../modules/project/project.route';
import { NoteRoutes } from '../modules/note/note.route';

import { ContractRoutes } from '../modules/contract/contract.route';
import { TaskRoutes } from '../modules/task/task.route';
import { AttachmentRoutes } from '../modules/attachments/attachment.route';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { SettingsRoutes } from '../modules/settings/settings.routes';

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
  {
    path: '/admin',
    route: AdminRoutes,
  },

  ////////////////////// Created By Mohammad Sheakh

  {
    path: '/settings',
    route: SettingsRoutes,
  },
  {
    path: '/note',
    route: NoteRoutes,
  },

  {
    path: '/contract',
    route: ContractRoutes,
  },
  {
    path: '/project',
    route: ProjectRoutes,
  },
  {
    path: '/task',
    route: TaskRoutes,
  },

  {
    path: '/attachment',
    route: AttachmentRoutes,
  },
  {
    path: '/activity',
    route: NotificationRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
