import express from 'express';
import { OrderController } from './order.controller';
import { IOrder } from './order.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import * as validation from './order.validation';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IOrder | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new OrderController();

//info : pagination route must be before the route with params
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
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

/*******
 * 
 * Patient | Dashboard | Create Order  
 * 
 * ******* */
router.route('/').post(
  auth(TRole.common), // actually patient can create order
  validateRequest(validation.createOrderOfAOrderValidationSchema),
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




export const OrderRoute = router;
