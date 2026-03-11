//@ts-ignore
import express from 'express';
import * as validation from './hireSpecialistRequestToAdmin.validation';
import { HireSpecialistRequestToAdminController} from './hireSpecialistRequestToAdmin.controller';
import { IHireSpecialistRequestToAdmin } from './hireSpecialistRequestToAdmin.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import { defaultExcludes } from '../../../constants/queryOptions';
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IHireSpecialistRequestToAdmin | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new HireSpecialistRequestToAdminController();

/*-─────────────────────────────────  // 💎✨🔍 -> V2 Found
|  Previous flow was admin can see all hire specialist request and can approve that .. 
└──────────────────────────────────*/
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  setQueryOptions({
    populate: [
      {
        path: "specialistId",
        select: `name email profileImage`
      },
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

/*-─────────────────────────────────  
|  Previous flow was admin can see all hire specialist request and can approve that .. 
└──────────────────────────────────*/
router.route('/paginate/v2').get(
  auth(TRole.specialist),
  validateFiltersForQuery(optionValidationChecking(['_id','specialistId', 'status', ...paginationOptions])),
  getLoggedInUserAndSetReferenceToUser('specialistId'),
  setQueryOptions({
    populate: [
      {
        path: "specialistId",
        select: `name email profileImage`
      },
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

router.route('/update/:id').put(
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
router.route('/change-status/:hireSpecialistId').put(
  auth(TRole.admin, TRole.specialist),
  controller.changeStatus
)

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth('commonAdmin'),
  controller.getAll
);

/** ----------------------------------------------
 * @role Patient
 * @Section Specialist's Profile
 * @module SpecialistPatient |
 * @figmaIndex 0-0
 * @desc patient request to admin for hiring a specialist .. admin will approve this 
 * 
*----------------------------------------------*/
router.route('/').post(
  auth(TRole.patient),
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

export const HireSpecialistRequestToAdminRoute = router;
