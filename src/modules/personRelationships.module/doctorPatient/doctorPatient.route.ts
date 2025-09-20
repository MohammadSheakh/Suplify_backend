//@ts-ignore
import express from 'express';
import * as validation from './doctorPatient.validation';
import { DoctorPatientController} from './doctorPatient.controller';
import { IDoctorPatient } from './doctorPatient.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
//@ts-ignore
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IDoctorPatient | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new DoctorPatientController();

/**********
 * 
 * Patient | Get all Patients Related Doctor .. 
 * 
 * ******** */
//info : pagination route must be before the route with params
router.route('/paginate').get(
  auth(TRole.patient, TRole.doctor),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

/**********
 * 
 * Patient | Get all Others Doctor .. 
 * 
 * ******** */
router.route('/paginate/others').get(
  auth(TRole.patient),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getUnknownDoctors
);


/**********
 * 
 * Specialist | Members and protocol 
 *  |-> Get all doctor and protocol count for a patient 
 *  :patientId:
 * ******** */
//info : pagination route must be before the route with params
router.route('/paginate/doctor-protocol').get(
  auth(TRole.patient, TRole.doctor, TRole.specialist),
  validateFiltersForQuery(optionValidationChecking(['_id','patientId', ...paginationOptions])),
  controller.getAllDoctorAndProtocolCountForPatient
);


/**********
 * 
 * Specialist | Members and protocol 
 *  |-> get all protocol for a doctor for patient 
 *  :patientId:
 *  :doctorId:
 * ******** */
router.route('/protocols-for-patient').get(
  auth(TRole.patient, TRole.doctor, TRole.specialist),
  validateFiltersForQuery(optionValidationChecking(['_id','patientId', 'doctorId', ...paginationOptions])),
  validateRequest(validation.getAllProtocolForADoctorFOrPatientValidationSchema),
  controller.getAllProtocolForADoctorForPatient
);

/**********
 * 
 * Doctor | Get all Patients For Provide Protocol 
 * 
 * ******** */
//info : pagination route must be before the route with params
router.route('/paginate/protocol').get(
  auth(TRole.doctor),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPaginationForDoctorProtocolSection
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

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/create').post(
  // [
  //   upload.fields([
  //     { name: 'attachments', maxCount: 15 }, // Allow up to 5 cover photos
  //   ]),
  // ],
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


export const doctorPatientRoute = router;
