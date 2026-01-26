//@ts-ignore
import express from 'express';
import * as validation from './suplifyHotspot.validation';
import { SuplifyHotspotController} from './suplifyHotspot.controller';
import { ISuplifyHotspot } from './suplifyHotspot.interface';
import { validateFiltersForQuery } from '../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../shared/validateRequest';
import auth from '../../middlewares/auth';
//@ts-ignore
import multer from "multer";
import { TRole } from '../../middlewares/roles';
import { setQueryOptions } from '../../middlewares/setQueryOptions';
import { defaultExcludes } from '../../constants/queryOptions';
import { imageUploadPipelineForUpdateSuplifyHotspot } from './suplifyHotspot.middleware';
import { setRequestFiltersV2 } from '../../middlewares/setRequstFilterAndValue';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof ISuplifyHotspot | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new SuplifyHotspotController();

//
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  setQueryOptions({
      populate: [ 
        { 
          path: 'attachments', 
          select: 'attachment',
          // populate: { path: 'profileId', select: 'gender location' }
        }
      ],
      select: `${defaultExcludes}`
    }),
    setRequestFiltersV2({
      isDeleted: false,
    }),
  controller.getAllWithPaginationV2
);

router.route('/:id').get(
  // auth('common'),
  controller.getById
);

router.route('/:id').put(
  //auth('common'),
  ...imageUploadPipelineForUpdateSuplifyHotspot,
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.updateWithImageById
);

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  controller.getAll
);

/** ----------------------------------------------
 * @role Admin 
 * @Section Suplify Hotspot 
 * @module WorkoutClass  
 * @figmaIndex 0-0
 * @desc we need this hotspot for WorkoutClass module   
 * 
*----------------------------------------------*/
router.route('/').post(
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 }, // Allow up to 1 cover photos
    ]),
  ],
  auth(TRole.admin),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.createWithAttachments
);

router.route('/:id').delete(
  auth(TRole.admin),
  controller.softDeleteById
);

// hard delete
router.route('/:id/permanent').delete(
  auth(TRole.admin),
  controller.deleteById
); 


////////////
//[🚧][🧑‍💻✅][🧪] // 🆗


export const SuplifyHotspotRoute = router;
