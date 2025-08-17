import express from 'express';
import * as validation from './product.validation';
import { ProductController} from './product.controller';
import { IProduct } from './product.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IProduct>(
  filters: T[]
) => {
  return filters;
};

// const taskService = new TaskService();
const controller = new ProductController();

//info : pagination route must be before the route with params
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id'])),
  controller.getAllWithPagination
);

/***********
 * 
 * ( Admin ) |  Get Shops all category with product counts //[🚧][🧑‍💻][🧪] //✅ 🆗
 * 
 * ********** */
router.route('/category-with-count').get(
  //auth('common'),
  controller.categoryWithCount
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

//[🚧][🧑‍💻✅][🧪] // 🆗 - suplify
router.route('/create').post(
  [
    upload.fields([
      { name: 'attachments', maxCount: 15 }, // Allow up to 5 cover photos
    ]),
  ],
  // auth('common'), // TODO: permission should be admin
  validateRequest(validation.createHelpMessageValidationSchema),
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

/***********
 * 
 * ( Admin ) |  Update Product By Id //[][🧑‍💻][🧪] //🚧✅ 🆗
 * 
 * ********** */





export const ProductRoute = router;
