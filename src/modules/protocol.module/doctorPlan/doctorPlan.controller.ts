//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { DoctorPlan } from './doctorPlan.model';
import { IDoctorPlan } from './doctorPlan.interface';
import { DoctorPlanService } from './doctorPlan.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import { PlanByDoctorService } from '../planByDoctor/planByDoctor.service';
import { IPlanByDoctor } from '../planByDoctor/planByDoctor.interface';
import { PlanByDoctor } from '../planByDoctor/planByDoctor.model';


let planByDoctorService = new PlanByDoctorService();

export class DoctorPlanController extends GenericController<
  typeof DoctorPlan,
  IDoctorPlan
> {
  doctorPlanService = new DoctorPlanService();

  constructor() {
    super(new DoctorPlanService(), 'DoctorPlan');
  }

  //---------------------------------
  // Doctor | Create Own plan .. so that later he can assign these plans to any patient
  //---------------------------------
  create = catchAsync(async (req: Request, res: Response) => {
    
    const data: IDoctorPlan = req.body;

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


  getAllWithPagination = catchAsync(async (req: Request, res: Response) => {
    req.query.createdBy  = (req.user as any).userId;
    
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const populateOptions: (string | {path: string, select: string}[]) = [
    ];

    const select = '-createdAt -updatedAt -__v -isDeleted'; // fields to exclude

    const query = {};

    // Create a copy of filter without isPreview to handle separately
    const mainFilter = { ...filters };

    // Loop through each filter field and add conditions if they exist
    for (const key of Object.keys(mainFilter)) {
      if (key === 'title' && mainFilter[key] !== '') {
        query[key] = { $regex: mainFilter[key], $options: 'i' }; // Case-insensitive regex search for name
      // } else {
      } else if (mainFilter[key] !== '' && mainFilter[key] !== null && mainFilter[key] !== undefined){
        //---------------------------------
        // In pagination in filters when we pass empty string  it retuns all data
        //---------------------------------
        query[key] = mainFilter[key];
      }
    }

    const result = await this.service.getAllWithPagination(/*filters,*/query, options, populateOptions, select);


    if(req.query.title == '' || !req.query.title){
      console.log("hit")
      sendResponse(res, {
        code: StatusCodes.OK,
        data: [],
        message: `All ${this.modelName} with pagination`,
        success: true,
      });  
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  getAllWithPaginationWithoutSearch = catchAsync(async (req: Request, res: Response) => {
    req.query.createdBy  = (req.user as any).userId;
    
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const populateOptions: (string | {path: string, select: string}[]) = [
    ];

    const select = '-createdAt -updatedAt -__v -isDeleted'; // fields to exclude

    const query = {};

    // Create a copy of filter without isPreview to handle separately
    const mainFilter = { ...filters };

    // Loop through each filter field and add conditions if they exist
    for (const key of Object.keys(mainFilter)) {
      if (key === 'title' && mainFilter[key] !== '') {
        query[key] = { $regex: mainFilter[key], $options: 'i' }; // Case-insensitive regex search for name
      // } else {
      } else if (mainFilter[key] !== '' && mainFilter[key] !== null && mainFilter[key] !== undefined){
        //---------------------------------
        // In pagination in filters when we pass empty string  it retuns all data
        //---------------------------------
        query[key] = mainFilter[key];
      }
    }

    const result = await this.service.getAllWithPagination(/*filters,*/query, options, populateOptions, select);
    
    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });



  // may be we dont need this 
  getAllWithPaginationV2 = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    // ✅ Default values
    let populateOptions: (string | { path: string; select: string }[]) = [];
    let select = '-isDeleted -createdAt -updatedAt -__v';

    // ✅ If middleware provided overrides → use them
    if (req.queryOptions) {
      if (req.queryOptions.populate) {
        populateOptions = req.queryOptions.populate;
      }
      if (req.queryOptions.select) {
        select = req.queryOptions.select;
      }
    }

    const result = await this.service.getAllWithPagination(filters, options, populateOptions , select );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });




  assignToPatient = catchAsync(async (req: Request, res: Response) => {
    const doctorPlanId = req.query.doctorPlanId as string;
    const patientId = req.query.patientId as string;
    const protocolId = req.query.protocolId as string;

    if(!doctorPlanId){
      throw new Error('doctorPlanId is required in query params');
    }
    if(!patientId){
      throw new Error('patientId is required in query params');
    }
    if(!protocolId){
      throw new Error('protocolId is required in query params');
    }

    const doctorPlan = await this.service.getById(doctorPlanId);

    if(!doctorPlan){
      throw new Error('No Doctor Plan found with this id');
    }

    //---------------------------------
    //  TODO :  check already this plan is assigned or not ...  
    //  Not Possible .. 
    //---------------------------------

    const newPlanData: IPlanByDoctor = {
      planType : doctorPlan.planType,
      createdBy : doctorPlan.createdBy, // doctor id
      protocolId : protocolId, // from query
      title : doctorPlan.title,
      description : doctorPlan.description,
      keyPoints : doctorPlan.keyPoints,
      totalKeyPoints : doctorPlan.totalKeyPoints,
      patientId : patientId // from query
    }

    const result = await planByDoctorService.create(newPlanData);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `Plan assigned to patient successfully`,
      success: true,
    });
  });


  // add more methods here if needed or override the existing ones 
}
