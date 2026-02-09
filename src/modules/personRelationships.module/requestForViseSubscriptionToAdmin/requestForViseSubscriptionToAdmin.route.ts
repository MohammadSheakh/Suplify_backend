//@ts-ignore
import express from 'express';
import * as validation from './requestForViseSubscriptionToAdmin.validation';
import { RequestForViseSubscriptionToAdminController} from './requestForViseSubscriptionToAdmin.controller';
import { IRequestForViseSubscriptionToAdmin } from './requestForViseSubscriptionToAdmin.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import { defaultExcludes } from '../../../constants/queryOptions';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IRequestForViseSubscriptionToAdmin | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new RequestForViseSubscriptionToAdminController();

//
router.route('/paginate').get(
  // auth(TRole.admin), // TODO : must auth guard add korte hobe 
  validateFiltersForQuery(optionValidationChecking(['_id', 'status', ...paginationOptions])),
  setQueryOptions({
    populate: [
      {
        path: "patientId",
        select: `name email subscriptionType profileImage`
      }
    ],
    select: `-isDeleted -updatedAt -__v`
    // // ${defaultExcludes}
  }),
  controller.getAllWithPaginationV2
);

router.route('/:id').get(
  // auth('common'),
  controller.getById
);

router.route('/:id').put(
  //auth('common'),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.updateById
);

/** ----------------------------------------------
 * @role Admin
 * @Section Admin End
 * @module SpecialistPatient |
 * @figmaIndex 0-0
 * @desc change different status approved-rejected or keep pending state 
 * 
*----------------------------------------------*/
router.route('/change-status/:viseSubscriptionRequestId').put(
  auth(TRole.admin),
  controller.changeStatus
)

router.route('/cancel-vise/:viseSubscriptionRequestId').put(
  auth(TRole.admin),
  controller.cancelViseSubscription
)

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth('commonAdmin'),
  controller.getAll
);

/** ----------------------------------------------
 * @role Patient
 * @Section 
 * @module RequestForViseSubscriptionToAdmin
 * @figmaIndex 0-0
 * @desc patient request to admin for vise subscription .. admin will approve this 
 * 
 * I think we dont this this api now .. because .. before requesting .. patient will form fill up the question answers
 * then he place request for vice subscription
*----------------------------------------------*/
router.route('/').post(
  auth(TRole.patient),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.create
);

router.route('/:id/permenent').delete(
  auth(TRole.specialist),
  controller.deleteById
);

router.route('/:id').delete(
  auth(TRole.specialist),
  controller.softDeleteById
);


export const RequestForViseSubscriptionToAdminRoute = router;
