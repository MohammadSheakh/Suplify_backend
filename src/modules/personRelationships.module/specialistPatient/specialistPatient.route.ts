//@ts-ignore
import express from 'express';
import * as validation from './specialistPatient.validation';
import { SpecialistPatientController} from './specialistPatient.controller';
import { ISpecialistPatient } from './specialistPatient.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
//@ts-ignore
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof ISpecialistPatient | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new SpecialistPatientController();

/**********
 * 
 * Patient | Get all Patients Related Specialist .. 
 * 
 * ******** */
//info : pagination route must be before the route with params
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

/**********
 * 
 * Patient | Get all Others Specialist .. 
 * 
 * ******** */
router.route('/paginate/others').get(
  auth(TRole.patient),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getUnknownSpecialist
);

/**********
 * 
 * Specialist | Members And Protocol | Show all patient and their doctors, subscriptionPlan
 * 
 * ********** */
router.route('/all-patients').get(
  auth(TRole.specialist),
  controller.showAllPatientsAndTheirDoctors
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

/**********
 * 
 * Doctor | Protocol Section | Show all Specialist for assign to a patient
 * :patientId:
 * ********** */
router.route('/specialist/:patientId').get(
  auth(TRole.doctor),
  controller.showAllSpecialist
);



/**********
 * 
 * Doctor | Protocol Section | Assign Specialist for a patient
 * 
 * ********** */
router.route('/').post(
  auth(TRole.doctor),
  validateRequest(validation.assignSpecialistForAPatientValidationSchema),
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


export const specialistPatientRoute = router;
