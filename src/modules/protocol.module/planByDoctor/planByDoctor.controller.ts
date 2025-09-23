//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { PlanByDoctor } from './planByDoctor.model';
import { IPlanByDoctor } from './planByDoctor.interface';
import { PlanByDoctorService } from './planByDoctor.service';
import catchAsync from '../../../shared/catchAsync';
import { IUser } from '../../token/token.interface';
import sendResponse from '../../../shared/sendResponse';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';


export class PlanByDoctorController extends GenericController<
  typeof PlanByDoctor,
  IPlanByDoctor
> {
  planByDoctorService = new PlanByDoctorService();

  constructor() {
    super(new PlanByDoctorService(), 'PlanByDoctor');
  }

  /*******
   * 
   * Doctor | Create plan for patient .. 
   * 
   * ***** */
  create = catchAsync(async (req: Request, res: Response) => {
    
    const data: IPlanByDoctor = req.body;

    data.createdBy = (req.user as IUser).userId;

    data.totalKeyPoints = data?.keyPoints?.length ? data?.keyPoints?.length : 0;

    const result = await this.service.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });


  /*******
   * 
   * Specialist | Members and protocol 
   *  |-> Get All plan For a protocol
   * 
   * ****** */
  getAllWithPaginationForSpecialist = catchAsync(async (req: Request, res: Response) => {
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const populateOptions: (string | {path: string, select: string}[]) = [
      
    ];

    const select = 'totalKeyPoints title'; 

    const result = await this.service.getAllWithPagination(filters, options, populateOptions, select);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  /**********
   * 
   * Specialist | Members and protocol | Get a plan with suggestions .. 
   * 
   * logged in specialist only can see his suggestions
   * 
   * TODO : later we need to implement for patient to see all specialist's
   * suggestions for a plan 
   * 
   * :planId:
   * ********* */
  getAPlanWithSuggestions = catchAsync(async (req: Request, res: Response) => {
    const { planByDoctorId } = req.query;
    const specialistId = (req.user as IUser).userId;

    const result = await this.planByDoctorService.getAPlanWithSuggestions(planByDoctorId, specialistId as string);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `Suggestions for ${this.modelName} with id ${planByDoctorId}`,
      success: true,
    });
  });


  /**********
   * 
   * Specialist | Members and protocol | Get a plan with suggestions .. 
   * 
   * logged in specialist only can see his suggestions
   * 
   * TODO : later we need to implement for patient to see all specialist's
   * suggestions for a plan 
   * 
   * :planId:
   * ********* */
  getAPlanWithSuggestionsByOnlyPlanId = catchAsync(async (req: Request, res: Response) => {
    const { planByDoctorId } = req.query;

    // const specialistId = (req.user as IUser).userId;

    const result = await this.planByDoctorService.getAPlanWithSuggestionsByOnlyPlanId(planByDoctorId /*, specialistId as string */);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `Suggestions for ${this.modelName} with id ${planByDoctorId}`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
