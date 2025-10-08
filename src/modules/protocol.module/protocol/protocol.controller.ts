//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { Protocol } from './protocol.model';
import { IProtocol } from './protocol.interface';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';
import { ProtocolService } from './protocol.service';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import { DoctorPatient } from '../../personRelationships.module/doctorPatient/doctorPatient.model';

export class ProtocolController extends GenericController<
  typeof Protocol,
  IProtocol
> {
  protocolService = new ProtocolService();

  constructor() {
    super(new ProtocolService(), 'Protocol');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const data:IProtocol = req.body;

    const protocolCount = await Protocol.find({
      createdBy: (req.user as IUser).userId,
      patientId: data.patientId
    }).countDocuments().lean();

    data.name = `Protocol ${protocolCount + 1}`; // temporary
    data.createdBy = (req.user as IUser).userId; // doctorId

    const result = await this.service.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  getAllWithPagination = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    filters.createdBy = (req.user as IUser).userId; // doctorId

    const populateOptions: (string | {path: string, select: string}[]) = [
    ];

    // const select = ''; 

    const result = await this.service.getAllWithPagination(filters, options, populateOptions/*, select*/);

    //---------------------------------
    // Get extraNote from doctorPatient collection
    //---------------------------------
    const extraNote = await DoctorPatient.findOne({
      doctorId: (req.user as IUser).userId,
      patientId: filters.patientId
    }).select('extraNote').lean();

    result.extraNote = extraNote; // TODO : make sure this works as expected

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
