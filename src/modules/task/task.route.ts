import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../shared/validateRequest';
import { TaskController } from './task.controller';
import { TaskUsingGenericController } from './taskUsingGeneric.controller';
import { TaskService } from './task.service';
import { Task } from './task.model';
import { validateFilters } from '../../middlewares/queryValidation/paginationQueryValidationMiddleware';
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// const taskService = new TaskService();
const taskUsingGenericController = new TaskUsingGenericController();

//info : pagination route must be before the route with params
router.route('/paginate').get(
  auth('projectManager'),
  validateFilters(['_id', 'title']),
  // TaskController.getAllTaskWithPagination
  taskUsingGenericController.getAllWithPagination // Info :  Done with generic controller
);

router.route('/:id').get(
  auth('projectManager'),
  // TaskController.getATask
  taskUsingGenericController.getById // Info :  Done with generic controller
);

router.route('/update/:taskId').put(
  auth('projectManager'),
  // validateRequest(UserValidation.createUserValidationSchema),
  TaskController.updateById
);

router.route('/').get(
  auth('projectManager'),
  // TaskController.getAllTask
  taskUsingGenericController.getAll // Info :  Done with generic controller
);

router.route('/create').post(
  [
    upload.fields([
      { name: 'attachments', maxCount: 15 }, // Allow up to 5 cover photos
    ]),
  ],
  auth('projectManager'),
  // validateRequest(UserValidation.createUserValidationSchema),
  TaskController.createTask
);

router
  .route('/delete/:id')
  .delete(auth('projectManager'), TaskController.deleteById);

export const TaskRoutes = router;
