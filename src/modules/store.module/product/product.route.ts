import express from 'express';
import * as validation from './product.validation';
import { ProductController} from './product.controller';
import { IProduct } from './product.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';

import multer from "multer";
import { setRequestFiltersV2 } from '../../../middlewares/setRequstFilterAndValue';
import { TRole } from '../../../middlewares/roles';
import { imageUploadPipelineForUpdateTrainingProgram } from '../../training.module/trainingProgram/trainingProgram.middleware';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IProduct  | 'sortBy' | 'page' | 'limit' | 'populate'>(
  filters: T[]
) => {
  return filters;
};

// const taskService = new TaskService();
const controller = new ProductController();

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy',
  'page',
  'limit',
  'populate',
];

//
router.route('/paginate').get(
  auth(TRole.common),
  validateFiltersForQuery(optionValidationChecking(['_id','category', ...paginationOptions ])),
  setRequestFiltersV2({
    isDeleted: false,
  }),
  controller.getAllWithPagination
);

//---------------------------------
// ( Admin ) |  Get Shops all category with product counts //[🚧][🧑‍💻][🧪] //✅ 🆗
//---------------------------------
router.route('/category-with-count').get(
  //auth('common'),
  controller.categoryWithCount
);

router.route('/:id').get(
  // auth('common'),
  controller.getById
);

//------------------------------------
// Admin | Update Product By Id 
//------------------------------------
router.route('/:id').put(
  auth(TRole.admin),
  ...imageUploadPipelineForUpdateTrainingProgram,
  // validateRequest(validation.createHelpMessageValidationSchema), // TODO : MUST
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

//---------------------------------
// ( Admin ) |  Update Product By Id //[][🧑‍💻][🧪] //🚧✅ 🆗
//---------------------------------


//---------------------------------
// ( Landing Page ) |  show-all-category-and-its-limited-products  //[][🧑‍💻][🧪] //🚧✅ 🆗
//---------------------------------
router.route('/by/category').get(
  //auth('patient'), 
  //---------------------------------
  //🟢 based on patients subscription status .. we  show labTest
  //---------------------------------
   
  controller.showAllCategoryAndItsLimitedProducts
)

//---------------------------------
// ( Landing Page ) |  get-product-details-with-related-products  //[][🧑‍💻][🧪] //🚧✅ 🆗
//---------------------------------
router.route('/:productId/related').get(
  controller.getProductDetailsWithRelatedProducts
)


export const ProductRoute = router;
