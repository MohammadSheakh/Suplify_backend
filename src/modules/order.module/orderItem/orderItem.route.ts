//@ts-ignore
import express from 'express';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import { OrderItemController } from './orderItem.controller';
import { IOrderItem } from './orderItem.interface';
//@ts-ignore
import multer from "multer";
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IOrderItem | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new OrderItemController();

//---------------------------------
// Admin | Get all order item for a order
//---------------------------------
//
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', 'orderId', ...paginationOptions])),
  controller.getAllWithPagination 
);

//---------------------------------
// Patient | Get all order item for a order
// with order information
//---------------------------------
router.route('/paginate/for-patient').get(
  auth(TRole.patient),
  validateFiltersForQuery(optionValidationChecking(['_id', 'orderId', ...paginationOptions])),
  controller.getAllWithPaginationForPatient 
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

router.route('/create').post(
  // [
  //   upload.fields([
  //     { name: 'attachments', maxCount: 15 }, // Allow up to 5 cover photos
  //   ]),
  // ],
  //auth('common'),
  // validateRequest(validation.createHelpMessageValidationSchema),
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

export const OrderItemRoute = router;
