//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { SpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.model';
import { ISpecialistWorkoutClassSchedule } from './specialistWorkoutClassSchedule.interface';
import { SpecialistWorkoutClassScheduleService } from './specialistWorkoutClassSchedule.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import { IUser } from '../../token/token.interface';
import { TRole } from '../../../middlewares/roles';
import { toLocalTime } from '../../../utils/timezone';
import { User } from '../../user/user.model';

export class SpecialistWorkoutClassScheduleController extends GenericController<
  typeof SpecialistWorkoutClassSchedule,
  ISpecialistWorkoutClassSchedule
> {
  specialistWorkoutClassScheduleService = new SpecialistWorkoutClassScheduleService();

  constructor() {
    super(new SpecialistWorkoutClassScheduleService(), 'SpecialistWorkoutClassSchedule');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const userTimeZone = req.header('X-Time-Zone') || 'Asia/Dhaka'; //TODO: Timezone must from env file

    const data:ISpecialistWorkoutClassSchedule = req.body;

    console.log("data :: ", data);
    
    data.createdBy = (req.user as IUser)?.userId; // speacialist Id

    const result = await this.specialistWorkoutClassScheduleService.createV2(data, userTimeZone);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });


  /***********
   * 
   * Patient | Get all workout class of a specialist with isBooked boolean field
   * //📈⚙️ OPTIMIZATION:
   * ********* */
  getAllWithAggregation = catchAsync(async (req: Request, res: Response) => {
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const result = await this.specialistWorkoutClassScheduleService.getAllWithAggregation(filters, options, req.user.userId);

    // get specialist information

    const specialistInfo = await User
        .findById(filters.createdBy)
        .select('profileImage name profileId')
        .populate({
            path: 'profileId', 
            select: 'description protocolNames howManyPrograms'
        });

    sendResponse(res, {
      code: StatusCodes.OK,
      data: {
        result,
        specialistInfo
      },
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });


  //TODO : need to add caching .. 
  /****
   * 
   * Specialist  | WorkoutClass | get all  .. (query -> scheduleStatus[available])
   * ******* */
  getAllWithPagination = catchAsync(async (req: Request, res: Response) => {
    const userTimeZone = req.header('X-Time-Zone') || 'Asia/Dhaka'; //TODO: Must Timezone must from env file
    
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); 
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    /***
     * 
     * if logged in user role is specialist .. then return for only his schedules... 
     * 
     * ***/
    if(req.user && (req.user as IUser)?.role === TRole.specialist){
      filters.createdBy = (req.user as IUser)?.userId; 
    }

    const populateOptions: (string | {path: string, select: string}[]) = [

    ];

    const select = '-createdAt -updatedAt -__v'; 

    // const result : IPaginateResult = await this.service.getAllWithPagination(filters, options, populateOptions, select);

    const [specialistInfo, result ] : [Partial<IUser>, IPaginateResult] = await Promise.all([
      User.findById((req.user as IUser)?.userId)
        .select('profileImage name profileId')
        .populate({
          path: 'profileId',
            select: '-attachments -__v'
        }),

        this.specialistWorkoutClassScheduleService.getAllWithAggregationForSpecialist(filters, options)
      // this.service.getAllWithPagination(filters, options, populateOptions, select)
    ]);

    //---  Convert startTime/endTime for each item in results
    const convertedResults = result.results.map(item => ({
      ...item, // .toObject()  must add .toObject() if this is mongoose document
      startTime: toLocalTime(item.startTime, userTimeZone),
      endTime: toLocalTime(item.endTime, userTimeZone),
    }));

    //@ts-ignore
    result.results = convertedResults;

    sendResponse(res, {
      code: StatusCodes.OK,
      data: {
        specialistInfo, 
        ...result
      },
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });


  // add more methods here if needed or override the existing ones 
}


interface IPaginateResult {
  results: ISpecialistWorkoutClassSchedule[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}