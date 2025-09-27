//@ts-ignore
import express from 'express';
import * as validation from './successTracker.validation';
import { SuccessTrackerController} from './successTracker.controller';
import { ISuccessTracker } from './successTracker.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof ISuccessTracker | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new SuccessTrackerController();

// ========================
// ROUTE ADDITIONS
// ========================

// Add these routes to your existing success tracker routes

// GET /success-tracker/overview - Get last 2 weeks comparison overview
router.get('/overview', 
  auth(TRole.patient),
  controller.getSuccessTrackerOverview);
  // getSuccessTrackerDetails




router.post('/create', 
  auth(TRole.patient),
  validateRequest(validation.createSuccessTrackerValidationSchema),
  controller.createSuccessTracker
);

//info : pagination route must be before the route with params
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

router.route('/:userId/:weekOffset').get(
   auth(TRole.patient),
  controller.getSuccessTrackerOverview
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


export const SuccessTrackerRoute = router;
