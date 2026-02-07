import express from 'express';
import * as validation from './question.validation';
import { QuestionController} from './question.controller';
import { IQuestion } from './question.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';

import multer from "multer";
import { TRole } from '../../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IQuestion | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new QuestionController();

//
router.route('/paginate').get(
  auth(TRole.common),
  validateFiltersForQuery(optionValidationChecking(['_id', ...paginationOptions])),
  controller.getAllWithPagination
);

/*-─────────────────────────────────
| Admin | get all question and answers 
|  @figmaIndex 
|  @desc 
└──────────────────────────────────*/
router.route('/question-ans').get(
  auth(TRole.common), // Adjust guards as needed
  controller.getQuestionsWithAnswersByPhase
);

router.route('/:id').get(
  // auth('common'),
  controller.getById
);

router.route('/:id').put(
  //auth('common'),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.updateById
);

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth('commonAdmin'),
  controller.getAll
);

/*-───────────────────────────────── 
| Admin | create question
|  @figmaIndex 
|  @desc admin create question and answers
└──────────────────────────────────*/
router.route('/').post(
  auth(TRole.admin),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.createV2
);

router.route('/:id/permenent').delete(
  auth(TRole.common),
  controller.deleteById
);

router.route('/:id').delete(
  auth(TRole.common),
  controller.softDeleteById
);



export const QuestionRoute = router;
