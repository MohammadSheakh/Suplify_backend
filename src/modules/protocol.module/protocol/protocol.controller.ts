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

  // add more methods here if needed or override the existing ones 
}
