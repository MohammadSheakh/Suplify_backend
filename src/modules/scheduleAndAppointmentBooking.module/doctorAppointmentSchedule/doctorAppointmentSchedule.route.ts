import express from 'express';
import * as validation from './doctorAppointmentSchedule.validation';
import { DoctorAppointmentScheduleController} from './doctorAppointmentSchedule.controller';
import { IDoctorAppointmentSchedule } from './doctorAppointmentSchedule.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IDoctorAppointmentSchedule | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new DoctorAppointmentScheduleController();

//info : pagination route must be before the route with params
router.route('/paginate').get(
  auth(TRole.doctor, TRole.patient),
  validateFiltersForQuery(optionValidationChecking(['_id','createdBy', 'scheduleStatus', ...paginationOptions])),
  controller.getAllWithPagination
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

/*********
 * 
 *  Doctor | Schedule | Create Doctor Appointment 
 * 
 * ******** */
router.route('/').post(
  auth(TRole.doctor),
  validateRequest(validation.createDoctorAppointmentScheduleValidationSchema),
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


export const DoctorAppointmentScheduleRoute = router;
