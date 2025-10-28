//@ts-ignore
import express from 'express';
import fileUploadHandler from '../../shared/fileUploadHandler';
import convertHeicToPngMiddleware from '../../shared/convertHeicToPngMiddleware';
import { UserController } from './user.controller';
import { validateFiltersForQuery } from '../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../middlewares/auth';
import { IUser } from './user.interface';
import { TRole } from '../../middlewares/roles';
import validateRequest from '../../shared/validateRequest';
const UPLOADS_FOLDER = 'uploads/users';
const upload = fileUploadHandler(UPLOADS_FOLDER);
import * as validation from './user.validation';
import { setQueryOptions } from '../../middlewares/setQueryOptions';
import { imageUploadPipelineForUpdateUserProfile } from './user.middleware';
import { getLoggedInUserIdAndSetInParams } from '../../middlewares/getLoggedInUserIdAndSetInParams';

export const optionValidationChecking = <T extends keyof IUser | 'sortBy' | 'page' | 'limit' | 'populate'>(
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

const router = express.Router();

// const taskService = new TaskService();
const controller = new UserController();

//---------------------------------
// Admin : User Management With Statistics
//---------------------------------
router.route('/paginate').get(
  auth(TRole.admin),
  validateFiltersForQuery(optionValidationChecking(['_id',
    'name',
    'email',
    'role',
    'subscriptionType',
    'approvalStatus',
    ...paginationOptions])),
  controller.getAllWithPaginationV2
);

//---------------------------------
// Specialist | Get Profile Information as logged in user 
//---------------------------------
router.route('/profile').get(
  auth(TRole.common), // any logged in user can see any user profile ..
  controller.getById
);


//---------------------------------
// Admin | Get Profile Information by Id  to approve doctor / specialist 
//---------------------------------
router.route('/profile/for-admin').get(
 auth(TRole.admin),
  validateFiltersForQuery(optionValidationChecking(['_id',
    ...paginationOptions])),
  controller.getAllWithPagination
);

//---------------------------------
// Admin | change approvalStatus of a doctor / specialist profile
//---------------------------------
router.route('/change-approval-status').put(
  auth(TRole.admin),
  validateRequest(validation.changeApprovalStatusValidationSchema),
  controller.changeApprovalStatusByUserId
)

router.route('/update/:id').put(
  //auth('common'),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.updateById
);

//---------------------------------
// Specialist | Doctor | Patient | Admin Get Profile Information By Id 
// TODO : make sure logged in user can see any user profile ..
//---------------------------------
router.route('/profile/:id').get(
  auth(TRole.common), // any logged in user can see any user profile ..
  getLoggedInUserIdAndSetInParams('id'),
  setQueryOptions({
    populate: [
      { path: 'profileId', select: 'approvalStatus protocolNames userId description address', /* populate: { path : ""} */ },
    ],
    select: 'name profileId email profileImage subscriptionType status role' //-createdAt
  }),
  controller.getByIdV2
);

//---------------------------------
// Specialist | Doctor | Patient | Admin Update Profile Information By Id 
// TODO : make sure logged in user can update only his information
//---------------------------------
router.route('/profile/:id').put(
  auth(TRole.common), // any logged in user can see any user profile ..
  ...imageUploadPipelineForUpdateUserProfile,
  controller.updateProfileOfSpecialistAndDoctor
);


//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth('commonAdmin'),
  controller.getAll
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


export const UserRoutes = router;

