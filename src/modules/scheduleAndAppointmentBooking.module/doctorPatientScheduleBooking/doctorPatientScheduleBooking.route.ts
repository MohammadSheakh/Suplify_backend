//@ts-ignore
import express from 'express';
import * as validation from './doctorPatientScheduleBooking.validation';
import { DoctorPatientScheduleBookingController} from './doctorPatientScheduleBooking.controller';
import { IDoctorPatientScheduleBooking } from './doctorPatientScheduleBooking.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
//@ts-ignore
import multer from 'multer';
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
// import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IDoctorPatientScheduleBooking | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new DoctorPatientScheduleBookingController();

//info : pagination route must be before the route with params
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);
/**********
 * 
 * Doctor | Upcoming Schedule | 
 * 
 * ********** */
router.route('/upcoming').get(
  auth(TRole.doctor),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  getLoggedInUserAndSetReferenceToUser('doctorId'),
  controller.getAllUpcomingSchedule
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
  auth(TRole.common),
  controller.getAll
);

/***********
 * 
 *  Patient | Book Appointment from Doctor's Available Schedule
 * 
 *  here we also check if relation ship between doctor and patient exist or not
 *  if not then we create the relationship 
 * *********** */
router.route('/:doctorScheduleId').post(
  auth(TRole.patient),
  validateRequest(validation.doctorPatientScheduleBookingValidationSchema),
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




export const DoctorPatientScheduleBookingRoute = router;
