import express from 'express';
import { TrainingProgramController } from './trainingProgram.controller';
import { IRrainingProgram, ITRrainingProgramModel } from './trainingProgram.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IRrainingProgram>(filters: T[]) => {
  return filters;
};

// const taskService = new TaskService();
const trainingProgramController = new TrainingProgramController();

//info : pagination route must be before the route with params
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', 'name', 'type', 'meetingLinkType'])),
  trainingProgramController.getAllWithPagination 
);

router.route('/:id').get(
  // auth('common'),
  trainingProgramController.getById 
);

router.route('/update/:taskId').put(
  //auth('common'), // FIXME: Change to admin
  // validateRequest(UserValidation.createUserValidationSchema),
  trainingProgramController.updateById
);

router.route('/').get(
  //auth('common'), // FIXME: maybe authentication lagbe na .. 
  trainingProgramController.getAll 
);

router.route('/create').post(
  // [
  //   upload.fields([
  //     { name: 'attachments', maxCount: 15 }, // Allow up to 5 cover photos
  //   ]),
  // ],
  //auth('common'),
  // validateRequest(UserValidation.createUserValidationSchema),
  trainingProgramController.create
);

router
  .route('/delete/:id')
  .delete(
    //auth('common'),
    trainingProgramController.deleteById); // FIXME : change to admin

router
.route('/softDelete/:id')
.put(
  //auth('common'),
  trainingProgramController.softDeleteById);

export const SuplifyPartnerRoute = router;
