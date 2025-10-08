import express from 'express';
import * as validation from './trainingSession.validation';
import { TrainingSessionController} from './trainingSession.controller';
import { ITrainingSession } from './trainingSession.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

//---------------------------------
// we need specilistId to show specialist's information
//---------------------------------
export const optionValidationChecking = <T extends keyof ITrainingSession | 'specialistId' |  'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new TrainingSessionController();

/**********
 * Specialist | Get all training session of a training program ..
 *              along with specialist information .. 
 * 📝 
 * we need specilistId to show specialist's information
 * ******* */
//info : pagination route must be before the route with params
router.route('/paginate').get(
  auth(TRole.patient, TRole.specialist),
  validateFiltersForQuery(optionValidationChecking(['_id', 'trainingProgramId', 'specialistId', ...paginationOptions])),
  controller.getAllWithPagination
);

router.route('/:id').get(
  // auth('common'),
  controller.getById
);

router.route('/update/:id').put(
  //auth('common'),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.updateById
);

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth('commonAdmin'),
  controller.getAll
);

//---------------------------------
// Specialist | Create Training Session
//---------------------------------
router.route('/').post(
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 },
      { name: 'coverPhotos', maxCount: 1 }, // Allow up to 1 cover photo
      { name: 'trailerContents', maxCount: 1 }, // Allow up to 1 trailer video
    ]),
  ],
  auth(TRole.specialist),
  validateRequest(validation.createTrainingSessionValidationSchema),
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


export const TrainingSessionRoute = router;
