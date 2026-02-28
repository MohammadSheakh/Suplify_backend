import express from 'express';
import * as validation from './clientDocuments.validation';
import { ClientDocumentsController} from './clientDocuments.controller';
import { IClientDocuments } from './clientDocuments.interface';
import { validateFiltersForQuery } from '../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../shared/validateRequest';
import auth from '../../middlewares/auth';

import multer from "multer";
import { TRole } from '../../middlewares/roles';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IClientDocuments | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new ClientDocumentsController();

/*-─────────────────────────────────
|  Doctor or Specialist can view patients uploaded documents . 
└──────────────────────────────────*/
router.route('/paginate').get(
  auth(TRole.common),
  validateFiltersForQuery(optionValidationChecking(['_id','patientId', ...paginationOptions])),
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

/*-─────────────────────────────────
|  Patient | patient can upload documents . 
| doctor and specialist can view this patients all documents 
└──────────────────────────────────*/
router.route('/').post(
  [
    upload.fields([
      { name: 'attachments', maxCount: 10 }, // Allow up to 5 cover photos
    ]),
  ],
  auth(TRole.patient),
  // validateRequest(validation.createHelpMessageValidationSchema),
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


export const ClientDocumentsRoute = router;
