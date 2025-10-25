//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
//@ts-ignore
import mongoose from 'mongoose';
import { GenericController } from '../../_generic-module/generic.controller';
import { DoctorPatient } from './doctorPatient.model';
import { IDoctorPatient } from './doctorPatient.interface';
import { DoctorPatientService } from './doctorPatient.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import { PaginationHelpers } from '../../../common/service/paginationHelpers';


export class DoctorPatientController extends GenericController<
  typeof DoctorPatient,
  IDoctorPatient
> {
  doctorPatientService = new DoctorPatientService();

  constructor() {
    super(new DoctorPatientService(), 'doctorPatient');
  }

  //---------------------------------
  // Admin | User Management | Assign Doctor for a patient
  //---------------------------------
  create = catchAsync(async (req: Request, res: Response) => {
    const data :IDoctorPatient = req.body;

    // check if already assigned
    const existing = await DoctorPatient.findOne({
      patientId: data.patientId,
      doctorId: data.doctorId
    }).lean();

    if(existing) {
      sendResponse(res, {
        code: StatusCodes.OK,
        data: existing,
        message: `Doctor already assigned to this patient`,
        success: true,
      });
    }

    const result = await this.service.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  //---------------------------------
  // Patient | Get all Patients Doctor .. 
  //---------------------------------
  getAllWithPagination = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const populateOptions: (string | {path: string, select: string}[]) = [
      {
        path: 'doctorId',
        select: 'name profileImage profileId',
        populate: {
          path: 'profileId', // deep populate attachments
          select: 'description' // only pick attachmentName
        }
      },
      // ''
    ];

   const select = '-isDeleted -createdAt -updatedAt -__v'; 

    const result = await this.service.getAllWithPagination(filters, options, populateOptions, select);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  //---------------------------------
  // Patient | Get all Unknown Doctor .. 
  //---------------------------------
  getUnknownDoctors = catchAsync(async (req: Request, res: Response) => {
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    // const { page, limit } = PaginationHelpers.extractPaginationFromQuery(req.query);
    
    const result = await this.doctorPatientService.getUnknownDoctorsForPatient(req.user.userId,
      // {
      //   page: options.page,
      //   limit: options.limit
      // }
      filters,
      options
    );

    // data: {
    //     doctors: result.results,
    //     pagination: result.pagination
    //   }
    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  //---------------------------------
  // Admin | Users Section | Get All Unknown Doctor For A Patient 
  //---------------------------------
  getUnknownDoctorsForAPatient = catchAsync(async (req: Request, res: Response) => {
    
    const result = await this.doctorPatientService.getUnknownDoctorsForPatient(req.params.patientId,
      // {
      //   page: options.page,
      //   limit: options.limit
      // }
      [], // filters
      [] // options
    );

    // data: {
    //     doctors: result.results,
    //     pagination: result.pagination
    //   }
    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  //---------------------------------
  // Doctor | Get all Patients For Provide Protocol 
  //---------------------------------
  getAllWithPaginationForDoctorProtocolSection = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const populateOptions: (string | {path: string, select: string}[]) = [
      {
        path: 'patientId',
        select: 'name profileImage profileId subscriptionType',
        populate: {
          path: 'profileId', // deep populate attachments
          select: 'howManyProtocol' // only pick howManyProtocol
        }
      },
      // ''
    ];

   const select = '-isDeleted -createdAt -updatedAt -__v'; 

    const result = await this.service.getAllWithPagination(filters, options, populateOptions, select);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });


  //---------------------------------
  // Specialist | Members and protocol 
  //  |-> Get all doctor and protocol count for a patient 
  //---------------------------------

  getAllDoctorAndProtocolCountForPatient = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const result = await this.doctorPatientService.getAllDoctorAndProtocolCountForPatient(
      filters.patientId, // from query .. must be sent from frontend
      filters,
      options
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  /**********
   * 
   * Specialist | Members and protocol 
   *  |-> get all protocol for a doctor for patient 
   *  :patientId:
   *  :doctorId:
   * ******** */
  getAllProtocolForADoctorForPatient = catchAsync(async (req: Request, res: Response) => {
    const { patientId, doctorId } = req.query;

    const result = await this.doctorPatientService.getAllProtocolForADoctorForPatient(
      patientId as string,
      doctorId as string
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All protocols for a doctor for patient`,
      success: true,
    });

  });

  // add more methods here if needed or override the existing ones 
}
