//@ts-ignore
import express from 'express';
import * as validation from './specialistWorkoutClassSchedule.validation';
import { SpecialistWorkoutClassScheduleController} from './specialistWorkoutClassSchedule.controller';
import { ISpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
//@ts-ignore
import multer from "multer";
import { patchWithDefaults } from '../../../middlewares/updateSomeFieldIfProvideInAModelOtherwiseKeepTheOriginalValue';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof ISpecialistWorkoutClassSchedule | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new SpecialistWorkoutClassScheduleController();


//---------------------------------
// Specialist | WorkoutClass | Get all Workout Class of a specialist
// TODO : INCOMPLETE : need to show booking count also 
//---------------------------------
//
router.route('/paginate').get(
  auth(TRole.specialist),
  validateFiltersForQuery(optionValidationChecking(['_id', 'createdBy', ...paginationOptions])),
  controller.getAllWithPagination
);

/*******
 * 
 * Patient | Get all Workout Class of a Specialist ..
 *  |-> with isBooked boolean field 
 * //📈⚙️ OPTIMIZATION:
 * ****** */
router.route('/paginate/for-patient').get(
  auth(TRole.patient),
  validateFiltersForQuery(optionValidationChecking(['_id', 'createdBy', ...paginationOptions])),
  controller.getAllWithAggregation
);


router.route('/:id').get(
  // auth('common'),
  controller.getById
);
//------------------------------
// Specialist | Update Workout Class
//-------------------------------
router.route('/:id').put(
  auth(TRole.specialist),
  //  ...imageUploadPipelineForUpdateWorkoutClass, // no image upload needed for workout class
  patchWithDefaults( //🥇
      'SpecialistWorkoutClassSchedule', 
      optionValidationChecking([ // pass array of fields that we want to update if provide in request body
        'scheduleDate',
        'startTime',
        'endTime',
        'scheduleName',
        'description',
        'typeOfLink',
        'sessionType',
        'meetingLink',
        'price'
      ])
    ),
  // validateRequest(validation.updateTrainingProgramValidationSchema), // TODO : MUST validation add korte hobe
  controller.updateById
);





//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth('commonAdmin'),
  controller.getAll
);
/********
 * 
 * Specialist | WorkoutClass | Create Workout Class
 * must send X-Time-Zone in header
 * ******** */
router.route('/').post(
  auth(TRole.specialist),
  validateRequest(validation.createWorkoutClassSessionValidationSchema),
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

export const SpecialistWorkoutClassScheduleRoute = router;
