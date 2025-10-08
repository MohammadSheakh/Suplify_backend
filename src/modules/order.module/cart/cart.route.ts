//@ts-ignore
import express from 'express';
import * as validation from './cart.validation';
import { CartController} from './cart.controller';
import { ICart } from './cart.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
//@ts-ignore
import  multer from 'multer';
import { TRole } from '../../../middlewares/roles';
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof ICart | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new CartController();

//---------------------------------
// Patient | Landing Page 
//---------------------------------
//
router.route('/paginate').get(
  auth(TRole.patient),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  getLoggedInUserAndSetReferenceToUser('userId'), // always filter by userId from logged in user Id
  controller.getAllWithPagination
);

//---------------------------------
//  Patient | Dashboard | View All cartItem And Details
//  :cartId: // INFO : we try to get cart without cartId .. by logged in userId
//---------------------------------
router.route('/view').get(
  auth(TRole.patient),
  validateRequest(validation.viewCartItemsOfACartValidationSchema),
  controller.viewCart
);

// router.route('/:id').get(
//   // auth('common'),
//   controller.getById
// );

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

//[🚧][🧑‍💻✅][🧪] // 🆗 
router.route('/create').post(
  // [
  //   upload.fields([
  //     { name: 'attachments', maxCount: 15 }, // Allow up to 5 cover photos
  //   ]),
  // ],
  auth('common'),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.create
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



export const CartRoute = router;
