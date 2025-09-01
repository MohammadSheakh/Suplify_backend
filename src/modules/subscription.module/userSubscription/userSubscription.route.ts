import express from 'express';

import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import { IUserSubscription } from './userSubscription.interface';
import { UserSubscriptionController } from './userSubscription.controller';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IUserSubscription | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new UserSubscriptionController();

//info : pagination route must be before the route with params
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id'])),
  controller.getAllWithPagination 
);

router.route('/:id').get(
  // auth('common'),
  controller.getById 
);

router.route('/update/:id').put(
  //auth('common'), // FIXME: Change to admin
  // validateRequest(UserValidation.createUserValidationSchema),
  controller.updateById
);

router.route('/').get(
  //auth('common'), // FIXME: maybe authentication lagbe na .. 
  controller.getAll 
);

router.route('/create').post(
  
  // validateRequest(UserValidation.createUserValidationSchema),
  controller.create
);

router
  .route('/delete/:id')
  .delete(
    //auth('common'),
    controller.deleteById); // FIXME : change to admin

router
.route('/softDelete/:id')
.put(
  //auth('common'),
  controller.softDeleteById);

/*********
 * 
 * Patient  | Landing Page | Start Free Trial
 * 
 * ****** */  
router.route('/free-trial/start').post(
  auth(TRole.patient),
  controller.startFreeTrial
);

export const UserSubscriptionRoute = router;
