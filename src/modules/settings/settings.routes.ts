import { Router } from 'express';
import auth from '../../middlewares/auth';
import { SettingsController } from './settings.controllers';
import { TRole } from '../../middlewares/roles';
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router
  .route('/')
  .get(auth(TRole.common), SettingsController.getDetailsByType)
  // FIXME : FormData te details send korle kaj hocche na .. raw kaj kortese
  .post(
    // auth(TRole.admin),
    [upload.single('introductionVideo')],
    SettingsController.createOrUpdateSettings
  );
export const SettingsRoutes = router;
