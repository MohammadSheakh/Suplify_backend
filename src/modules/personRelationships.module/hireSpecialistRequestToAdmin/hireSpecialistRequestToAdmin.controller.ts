//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { HireSpecialistRequestToAdmin } from './hireSpecialistRequestToAdmin.model';
import { IHireSpecialistRequestToAdmin } from './hireSpecialistRequestToAdmin.interface';
import { HireSpecialistRequestToAdminService } from './hireSpecialistRequestToAdmin.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { ISpecialistPatient } from '../specialistPatient/specialistPatient.interface';
import { SpecialistPatient } from '../specialistPatient/specialistPatient.model';

export class HireSpecialistRequestToAdminController extends GenericController<
  typeof HireSpecialistRequestToAdmin,
  IHireSpecialistRequestToAdmin
> {
  HireSpecialistRequestToAdminService = new HireSpecialistRequestToAdminService();

  constructor() {
    super(new HireSpecialistRequestToAdminService(), 'HireSpecialistRequestToAdmin');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const data :ISpecialistPatient = req.body;

    // check if already assigned
    const existing = await SpecialistPatient.findOne({
      patientId: data.patientId,
      specialistId: data.specialistId
    }).lean();

    if(existing) {
      sendResponse(res, {
        code: StatusCodes.OK,
        data: existing,
        message: `Specialist already assigned to this patient`,
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

  // add more methods here if needed or override the existing ones 
}
