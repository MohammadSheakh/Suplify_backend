//@ts-ignore
import express from 'express';
import * as validation from './doctorPlan.validation';
import { DoctorPlanController} from './doctorPlan.controller';
import { IDoctorPlan } from './doctorPlan.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
//@ts-ignore
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
import { TRole } from '../../../middlewares/roles';
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
const router = express.Router();

export const optionValidationChecking = <T extends keyof IDoctorPlan | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new DoctorPlanController();
//---------------------------------
// Doctor | get own all plan by category 
//---------------------------------
//
router.route('/paginate').get(
  auth(TRole.doctor),
  validateFiltersForQuery(optionValidationChecking(['_id','planType', 'title',  ...paginationOptions])),
  // getLoggedInUserAndSetReferenceToUser('createdBy'),
  controller.getAllWithPagination // V2
);

router.route('/:id').get(
  // auth('common'),
  controller.getById
);

//---------------------------------
// Doctor | Update Own plan .. params :: doctorPlanId
//---------------------------------
router.route('/update/:id').put(
  auth(TRole.doctor),
  validateRequest(validation.updateDoctorPlanValidationSchema),
  controller.updateById
);

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth('commonAdmin'),
  controller.getAll
);
//---------------------------------
// Doctor | Create Own plan .. so that later he can assign these plans to any patient
//---------------------------------
router.route('/').post(
  auth(TRole.doctor),
  validateRequest(validation.createDoctorPlanValidationSchema),
  controller.create
);

/*******
 * 
 * Doctor | Assign Own Plan to a patient  
 * query params :: doctorPlanId
 * query params :: patientId
 * query params :: protocolId ( for which protocol this plan is assigned)
 * ******* */
router.route('/assign-to-patient').post(
  auth(TRole.doctor),
  controller.assignToPatient
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


export const DoctorPlanRoute = router;
