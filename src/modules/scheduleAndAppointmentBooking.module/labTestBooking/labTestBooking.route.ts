//@ts-ignore
import express from 'express';
import { ILabTestBooking } from './labTestBooking.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { LabTestBookingController } from './labTestBooking.controller';
import * as validation from './labTestBooking.validation';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../../middlewares/roles';
import { imageUploadPipelineForUpdateLabTestBooking } from './labTestBooking.middleware';
import { setQueryOptions } from '../../../middlewares/setQueryOptions';
import { defaultExcludes } from '../../../constants/queryOptions';
import { getLoggedInUserAndSetReferenceToUser } from '../../../middlewares/getLoggedInUserAndSetReferenceToUser';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof ILabTestBooking | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new LabTestBookingController();

//------------------------------
// Admin | Get all lab test booking .. 
//-------------------------------
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', 'status', 'patientId', ...paginationOptions])),
  setQueryOptions({
    populate: [ 
      { 
        path: 'uploadedResults', 
        select: 'attachment',
        // populate: { path: 'profileId', select: 'gender location' }
      },
      { 
        path: 'patientId', 
        select: 'name profileImage role',
        // populate: { path: 'profileId', select: 'gender location' }
      },
      { 
        path: 'labTestId', 
        select: 'name attachment description price',
        // populate: { path: 'profileId', select: 'gender location' }
      }
    ],
    select: `${defaultExcludes}`
    // // ${defaultExcludes}
  }),
  // controller.getAllWithPagination
  controller.getAllWithPaginationV2
);

//🆕
router.route('/paginate/for-patient').get(
  auth(TRole.patient),
  validateFiltersForQuery(optionValidationChecking(['_id', 'status', 'patientId', ...paginationOptions])),
  setQueryOptions({
    populate: [ 
      { 
        path: 'uploadedResults', 
        select: 'attachment',
        // populate: { path: 'profileId', select: 'gender location' }
      },
      { 
        path: 'patientId', 
        select: 'name profileImage role',
        // populate: { path: 'profileId', select: 'gender location' }
      },
      { 
        path: 'labTestId', 
        select: 'name attachment description price',
        // populate: { path: 'profileId', select: 'gender location' }
      }
    ],
    select: `${defaultExcludes}`
    // // ${defaultExcludes}
  }),
  getLoggedInUserAndSetReferenceToUser('patientId'),
  // controller.getAllWithPagination
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


/** ---------------------------------------------- // 🆕
 * @role Doctor | Admin
 * @Section Lab Test Booking Section.. | Get all protocol for a patient section ..
 * @module LabTestBooking 
 * @figmaIndex 0-0
 * @desc  admin can see and upload lab test results .. and doctor can also
 * go to a patients protocol section  to view all lab test and go to a test to 
*----------------------------------------------*/
router.route('/v2/:id').put(
  auth(TRole.admin, TRole.doctor),
  ...imageUploadPipelineForUpdateLabTestBooking,
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.updateWithImageById
);


//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth('commonAdmin'),
  controller.getAll
);

//--------------------------------------
// Patient  | Create Lab Test Booking
//--------------------------------------
router.route('/').post(
  auth(TRole.patient),
  // validateRequest(validation.createLabTestBookingValidationSchema),
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


export const LabTestBookingRoute = router;
