import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../shared/validateRequest';
import { TaskController } from './task.controller';
import { SuplifyPartnerController, TaskUsingGenericController } from './suplifyPartner.controller';
import { TaskService } from './suplifyPartner.service';
import { Task } from './suplifyPartner.model';
import { validateFilters } from '../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import { ISuplifyPartner } from './suplifyPartner.interface';
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const createValidatedFilters = <T extends keyof ISuplifyPartner>(filters: T[]) => {
  return filters;
};

// const taskService = new TaskService();
const suplifyPartnerController = new SuplifyPartnerController();

//info : pagination route must be before the route with params
router.route('/paginate').get(
  auth('common'),
  validateFilters(createValidatedFilters(['_id', 'partnerName'])),
  suplifyPartnerController.getAllWithPagination 
);

router.route('/:id').get(
  auth('projectManager'),
  suplifyPartnerController.getById 
);

router.route('/update/:taskId').put(
  auth('projectManager'),
  // validateRequest(UserValidation.createUserValidationSchema),
  suplifyPartnerController.updateById
);

router.route('/').get(
  auth('projectManager'),
  // TaskController.getAllTask
  suplifyPartnerController.getAll // Info :  Done with generic controller
);

// router.route('/create').post(
//   [
//     upload.fields([
//       { name: 'attachments', maxCount: 15 }, // Allow up to 5 cover photos
//     ]),
//   ],
//   auth('projectManager'),
//   // validateRequest(UserValidation.createUserValidationSchema),
//   suplifyPartnerController.createTask
// );

router
  .route('/delete/:id')
  .delete(auth('projectManager'), suplifyPartnerController.deleteById);

export const TaskRoutes = router;
