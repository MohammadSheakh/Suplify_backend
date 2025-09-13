//@ts-ignore
import express from 'express';
import * as validation from './trainingProgram.validation';
import { TrainingProgramController} from './trainingProgram.controller';
import { ITrainingProgram } from './trainingProgram.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
//@ts-ignore
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof ITrainingProgram | 'sortBy' | 'page' | 'limit' | 'populate'>(
  filters: T[]
) => {
  return filters;
};

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy',
  'page',
  'limit',
  'populate',
];

// const taskService = new TaskService();
const controller = new TrainingProgramController();
/*******
 * 
 * Patient | Get all Training Program of a Specialist .. 
 * ⚠️ need to add aggregation
 * ****** */
//info : pagination route must be before the route with params
router.route('/paginate').get(
  auth(TRole.patient),
  validateFiltersForQuery(optionValidationChecking(['_id', 'createdBy', ...paginationOptions])),
  controller.getAllWithAggregation
);

router.route('/:id').get(
  // auth('common'),
  controller.getById
);

router.route('/update/:id').put(
  //auth('common'),
  // validateRequest(UserValidation.createUserValidationSchema),
  controller.updateById
);

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth('commonAdmin'),
  controller.getAll
);

/******
 * 
 * Specialist | Specialist Dashboard | Create Training Program...  
 * 
 * ****** */
router.route('/').post(
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 }, // Allow up to 1 cover photo
      { name: 'trailerContents', maxCount: 1 }, // Allow up to 1 trailer video
    ]),
  ],
  auth(TRole.specialist),
  validateRequest(validation.createTrainingProgramValidationSchema),
  controller.createWithAttachments
);

router.route('/delete/:id').delete(
  //auth('common'),
  controller.deleteById
); // FIXME : change to admin

router.route('/softDelete/:id').put(
  //auth('common'),
  controller.softDeleteById
);

////////////
//[🚧][🧑‍💻✅][🧪] // 🆗


export const TrainingProgramRoute = router;
