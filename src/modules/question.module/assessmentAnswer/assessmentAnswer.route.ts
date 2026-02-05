import express from 'express';
import * as validation from './assessmentAnswer.validation';
import { AssessmentAnswerController} from './assessmentAnswer.controller';
import { IAssessmentAnswer } from './assessmentAnswer.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';

import multer from "multer";
import { TRole } from '../../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IAssessmentAnswer | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new AssessmentAnswerController();

//
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
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

/*-───────────────────────────────── // 💎✨🔍 -> V2 Found
| Patient | submit Answer 
|  @figmaIndex 
|  @desc 
└──────────────────────────────────*/
router.route('/').post(
  auth(TRole.admin), // TODO : MUST : Change to patient .. 
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.submitAnswers // submit answer
);

/*-─────────────────────────────────
| Patient | submit Answer and checkout to stripe to purchase subscription
|  @figmaIndex 
|  @desc 
└──────────────────────────────────*/
router.route('/v2').post(
  auth(TRole.admin), // TODO : MUST : Change to patient .. 
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.submitAnswersV2 // submit answer
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


export const AssessmentAnswerRoute = router;
