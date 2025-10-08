import express from 'express';
import * as validation from './cartItem.validation';
import { CartItemController} from './cartItem.controller';
import { ICartItem } from './cartItem.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';

import multer from "multer";
import { TRole } from '../../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof ICartItem | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new CartItemController();

//
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

//---------------------------------
// Patient | Increment or decrement count by type
// :type: it can be inc or dec
//---------------------------------

router.route('/count-update/:id').put(
  auth(TRole.patient),
  controller.updateCountWithType
)

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
// Patient | Dashboard | add to cart 
//---------------------------------
router.route('/create').post(
  auth(TRole.patient),
  validateRequest(validation.addToCartValidationSchema),
  controller.create
);

router.route('/delete/:id').delete(
  //auth('common'),
  controller.deleteById
); // FIXME : change to admin

//---------------------------------
// Patient | Remove an cartItem by cartItemId 
// also decrease itemCount in cart 
//---------------------------------

router.route('/softDelete/:id').put(
  //auth('common'),
  controller.softDeleteById
);

////////////
//[🚧][🧑‍💻✅][🧪] // 🆗



export const CartItemRoute = router;
