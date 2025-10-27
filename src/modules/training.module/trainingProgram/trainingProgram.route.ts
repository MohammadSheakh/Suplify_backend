//@ts-ignore
import express from 'express';
import * as validation from './trainingProgram.validation';
import { TrainingProgramController} from './trainingProgram.controller';
import { ITrainingProgram } from './trainingProgram.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
//@ts-ignore
import multer from "multer";
import { imageUploadPipelineForUpdateTrainingProgram } from './trainingProgram.middleware';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import { defaultExcludes } from '../../../constants/queryOptions';
import { patchWithDefaults } from '../../../middlewares/updateSomeFieldIfProvideInAModelOtherwiseKeepTheOriginalValue';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof ITrainingProgram | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new TrainingProgramController();
/*******
 * 
 * Patient | Get all Training Program of a Specialist ..
 *  |-> with isPurchased boolean field 
 * //📈⚙️ OPTIMIZATION:
 * ****** */
router.route('/paginate').get(
  auth(TRole.patient),
  validateFiltersForQuery(optionValidationChecking(['_id', 'createdBy', ...paginationOptions])),
  controller.getAllWithAggregation
);

//---------------------------------
// Specialist | Get all Training Program of a Specialist .. 
//---------------------------------
//
router.route('/specialist/paginate/').get(
  auth(TRole.specialist),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

//---------------------------------
// Specialist | Get a Training Program for Specialist .. for update 
//---------------------------------
router.route('/:id').get(
  auth(TRole.common),
  setQueryOptions({
    populate: [ { 
      path: 'attachments trailerContents', 
      select: 'attachment',
      // populate: { path: 'profileId', select: 'gender location' }
    }],
    select: `${defaultExcludes}`
    // // ${defaultExcludes}
  }),
  controller.getByIdV2
);


/*-------------------------- for router.route('/:id').put( 🥇
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 }, // Allow up to 1 cover photo
      { name: 'trailerContents', maxCount: 1 }, // Allow up to 1 trailer video
    ]),
  ],
  // validateRequest(validation.createHelpMessageValidationSchema),
  processUploadedFiles([ // middleware
    {
      name: 'attachments',
      folder: TFolderName.trainingProgram,
      required: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    },
    {
      name: 'trailerContents',
      folder: TFolderName.trainingProgram,
      allowedMimeTypes: ['video/mp4', 'video/mov'],
    },
  ]),
  --------------------------*/


//--------------------------------------
// 🔁-🧱💪-🥇
// Lets build a way .. by that we can create a general update route .. 
// where all image upload + and upload logic .. like .. does that upload change the previous image ..
// or add image with previous images .. 
//--------------------------------------
router.route('/:id').put( // update/
  auth(TRole.specialist),
  
  ...imageUploadPipelineForUpdateTrainingProgram, //🥇

  patchWithDefaults( //🥇
    'TrainingProgram', // pass model name .. if you provide wrong model name then it will show an ERROR : UnhandledRejection Detected Schema hasn't been registered for model "ServiceBooking".
    [ // pass array of fields that we want to update if provide in request body
      'durationInMonths',
      'price',
      'totalSessionCount',
      'description',
      'programName',
    ]
  ),
  // validateRequest(validation.updateTrainingProgramValidationSchema), 
  /**
   * FiXED FOR NOW .. but validation must be added later 
   * ** */
  controller.updateById
);

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth('commonAdmin'),
  controller.getAll
);

//---------------------------------
// Specialist | Specialist Dashboard | Create Training Program...  
//---------------------------------
router.route('/').post(
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 }, // Allow up to 1 cover photo
      { name: 'trailerContents', maxCount: 1 }, // Allow up to 1 trailer video
    ]),
  ],
  auth(TRole.specialist),
  validateRequest(validation.createTrainingProgramValidationSchema),
  controller.createWithAttachments
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


export const TrainingProgramRoute = router;

//--------------- All Pipelines
