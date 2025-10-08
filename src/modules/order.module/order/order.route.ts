//@ts-ignore
import express from 'express';
import { OrderController } from './order.controller';
import { IOrder } from './order.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import * as validation from './order.validation';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
//@ts-ignore
import multer from "multer";
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

//---------------------------------
// Admin | Get All Order with pagination 
//---------------------------------
//info : pagination route must be before the route with params
router.route('/paginate').get(
  auth(TRole.admin, TRole.patient),
  validateFiltersForQuery(optionValidationChecking(['_id', 
    'orderRelatedTo', // only one option available .. which is product
    'userId', // who place the order
    'status', // pending-processing-confirmed-completed-failed-refunded-cancelled
    'finalAmount', 
    'paymentMethod',
    'paymentTransactionId',
    'paymentStatus', // unpaid-paid-refunded
    'isDeleted',
    ...paginationOptions])),
  controller.getAllWithPagination 
);

router.route('/:id').get(
  // auth('common'),
  controller.getById 
);

router.route('/update/:id').put(
  //auth('common'), // FIXME: Change to admin
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.updateById
);

router.route('/').get(
  //auth('common'), // FIXME: maybe authentication lagbe na .. 
  controller.getAll 
);

//---------------------------------
// Patient | Dashboard | Create Order  
//---------------------------------
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
