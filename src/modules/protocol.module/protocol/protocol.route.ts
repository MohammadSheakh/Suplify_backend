//@ts-ignore
import express from 'express';
import * as validation from './protocol.validation';
import { ProtocolController} from './protocol.controller';
import { IProtocol } from './protocol.interface';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import validateRequest from '../../../shared/validateRequest';
import auth from '../../../middlewares/auth';
import { TRole } from '../../../middlewares/roles';
//@ts-ignore
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IProtocol | 'sortBy' | 'page' | 'limit' | 'populate'>(
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
const controller = new ProtocolController();

/*********
 * 
 * Doctor | Show all protocol for a patient with extraNote from doctorPatient 
 * TODO : confusion in total plan calculation 
 * ⚠️    ->  bad code .. Need to optimize
 * ******** */
//
router.route('/paginate').get(
  auth(TRole.doctor),
  validateFiltersForQuery(optionValidationChecking(['_id','patientId', ...paginationOptions])),
  controller.getAllWithPagination
);



router.route('/:id').get(
  // auth('common'),
  controller.getById
);

//---------------------------------
// Doctor | Update Protocol Name TODO : only specific fields should be updated
//---------------------------------
router.route('/update/:id').put(
  auth(TRole.doctor),
  // validateRequest(validation.createHelpMessageValidationSchema),
  controller.updateById
);

//[🚧][🧑‍💻✅][🧪] // 🆗
router.route('/').get(
  auth('commonAdmin'),
  controller.getAll
);

//---------------------------------
// Doctor  | Create Protocol For Patient
//---------------------------------

router.route('/').post(
  auth(TRole.doctor),
  validateRequest(validation.createProtocolValidationSchema),
  controller.create
);

// TODO : Show all protocol for a patient + extraNote(from doctorPatient) 

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


export const protocolRoute = router;
