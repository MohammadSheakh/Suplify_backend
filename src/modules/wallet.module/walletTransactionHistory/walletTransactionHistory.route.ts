//@ts-ignore
import express from 'express';
import * as validation from './walletTransactionHistory.validation';
import { WalletTransactionHistoryController} from './walletTransactionHistory.controller';
import { IWalletTransactionHistory } from './walletTransactionHistory.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IWalletTransactionHistory | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new WalletTransactionHistoryController();

//---------------------------------
// Specialist | Doctor 
// get all transaction history with wallet balance 
//---------------------------------
router.route('/paginate').get(
  auth(TRole.specialist, TRole.doctor, TRole.admin),
  validateFiltersForQuery(optionValidationChecking(['_id', 'walletId', ...paginationOptions])),
  getLoggedInUserAndSetReferenceToUser('userId'),
  controller.getAllWithPaginationV2
);

//--------------------------------
// Specialist | Doctor 
// Get Overview of Earnings
//---------------------------------
router.route('/overview').get(
  auth(TRole.common),
  controller.getMyEarningsOverview
);

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

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/create').post(
  auth('common'),
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

////////////
//[🚧][🧑‍💻✅][🧪] // 🆗


export const WalletTransactionHistoryRoute = router;
