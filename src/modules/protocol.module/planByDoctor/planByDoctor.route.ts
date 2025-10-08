//@ts-ignore
import express from 'express';
import * as validation from './planByDoctor.validation';
import { PlanByDoctorController} from './planByDoctor.controller';
import { IPlanByDoctor } from './planByDoctor.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
//@ts-ignore
import multer from "multer";
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IPlanByDoctor | 'sortBy' | 'page' | 'limit' | 'populate'>(
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

const controller = new PlanByDoctorController();

//---------------------------------
// Doctor | Get All plan by category For a patient
//---------------------------------
//
router.route('/paginate').get(
  auth(TRole.doctor, TRole.specialist),
  validateFiltersForQuery(optionValidationChecking(['_id', 'planType','patientId', 'protocolId', ...paginationOptions])),
  controller.getAllWithPagination
);

/*******
 * 
 * Specialist | Members and protocol 
 *  |-> Get All plan For a protocol
 * 
 * ****** */
router.route('/paginate/for-specialist').get(
  auth(TRole.doctor, TRole.specialist),
  validateFiltersForQuery(optionValidationChecking(['_id', 'planType','patientId', 'protocolId', ...paginationOptions])),
  controller.getAllWithPaginationForSpecialist
);

/*******
 * 
 * Patient |  protocol 
 *  |-> Get All plan For a protocol and planType for a patient 
 * 
 * ****** */
router.route('/paginate/for-patient').get(
  auth(TRole.patient),
  validateFiltersForQuery(optionValidationChecking(['_id', 'planType', 'protocolId', ...paginationOptions])),
  getLoggedInUserAndSetReferenceToUser('patientId'),
  controller.getAllWithPaginationForPatient
);


/**********
 * 
 * Specialist | Members and protocol | Get a plan with suggestions .. 
 *  
 * logged in specialist only can see his suggestions
 * 
 * TODO : later we need to implement for patient to see all specialist's
 * suggestions for a plan
 * 
 * :planByDoctorId:
 * 
 * specialistid will come from logged in user(specialist) 
 * 
 * ********* */
router.route('/with-suggestions').get(
  auth(TRole.specialist, TRole.patient),
  validateRequest(validation.getPlanWithSuggestionsValidationSchema),
  controller.getAPlanWithSuggestions
);

/**********
 * 
 * Patient |  protocol | Get a plan with suggestions .. 
 * Specialist | Members and protocol | Get a plan with suggestions ..
 *  
 * TODO : later we need to implement for patient to see all specialist's
 * suggestions for a plan
 * 
 * :planByDoctorId:
 * 
 * ********* */
router.route('/with-suggestions/for-patient').get(
  auth(TRole.patient),
  validateRequest(validation.getPlanWithSuggestionsValidationSchema),
  controller.getAPlanWithSuggestionsByOnlyPlanId
);

/**********
 * 
 * Patient | Specialist Suggestion fig03 
 * | -> get All Plan With Suggestions For Patient
 * 
 *  we have protocolId, planType .. 
 * 
 * ********* */
router.route('/with-suggestions/get-all').get(
  auth(TRole.patient),
  // validateRequest(validation.getPlanWithSuggestionsValidationSchema), // TODO: validation add korte hobe
  controller.getAllPlanWithSuggestionsForPatient
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

//--------------------------------- 
// Doctor | Create plan for patient
//---------------------------------
router.route('/').post(
  auth(TRole.doctor),
  // validateRequest(validation.createHelpMessageValidationSchema), // TODO: validation add korte hobe 
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


export const PlanByDoctorRoute = router;
