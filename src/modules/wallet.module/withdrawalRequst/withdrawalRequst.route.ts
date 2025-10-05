//@ts-ignore
import express from 'express';
import * as validation from './withdrawalRequst.validation';
import { WithdrawalRequstController} from './withdrawalRequst.controller';
import { IWithdrawalRequst } from './withdrawalRequst.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IWithdrawalRequst | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new WithdrawalRequstController();

/************
 * 
 * TODO : MUST : NEED_TO_TEST
 * Admin | Show All Withdraw Request 
 * 
 * ******** */
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

/************
 * 
 *  Admin | Upload receipt And Update status 
 * 
 * :id actually withdrawalRequestId
 * ********** */
router.route('/:id').put(
  auth(TRole.admin),
  [
    upload.fields([
      { name: 'proofOfPayment', maxCount: 1 }, // Allow up to 1 photos
    ]),
  ],
  validateRequest(validation.updateStatusOfWithdrawalRequestValidationSchema),
  controller.uploadReceiptAndUpdateStatus //updateById
);

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth('commonAdmin'),
  controller.getAll
);


/***********
 * 
 * Specialist / Doctor  | Wallet | Create withdrawal request
 * 
 * ******** */
router.route('/').post(
  auth(TRole.doctor, TRole.specialist),
  validateRequest(validation.createWithdrawalRequstValidationSchema),
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


export const WithdrawalRequstRoute = router;
