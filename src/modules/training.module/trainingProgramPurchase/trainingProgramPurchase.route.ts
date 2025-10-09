//@ts-ignore
import express from 'express';
import * as validation from './trainingProgramPurchase.validation';
import { TRole } from '../../../middlewares/roles';
import { ITrainingProgramPurchase } from './trainingProgramPurchase.interface';
import { TrainingProgramPurchaseController } from './trainingProgramPurchase.controller';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof ITrainingProgramPurchase | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new TrainingProgramPurchaseController();

//------------------------------
// Specialist |  Training Program Purchase History
//------------------------------
router.route('/paginate').get(
  auth(TRole.specialist),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  getLoggedInUserAndSetReferenceToUser('specialistId'),
  setQueryOptions({
      populate: [
        { path: 'patientId', select: 'name subscriptionType', /* populate: { path : ""} */ },
      ],
      select: '-isDeleted  -updatedAt -__v' //-createdAt
    }),
  controller.getAllWithPaginationV2
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

/********
 * 
 * Patient |  Purchase Training Program 
 * 
 * here we also check if relation ship between specialist and patient exist or not
 * if not then we create the relationship 
 * 
 * ***** */
router.route('/:trainingProgramId').post(
  auth(TRole.patient),
  // validateRequest(validation.purchaseTrainingProgramValidationSchema),
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


export const TrainingProgramPurchaseRoute = router;
