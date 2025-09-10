//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { DoctorPatient } from './doctorPatient.model';
import { IDoctorPatient } from './doctorPatient.interface';
import { DoctorPatientService } from './doctorPatient.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class DoctorPatientController extends GenericController<
  typeof DoctorPatient,
  IDoctorPatient
> {
  doctorPatientService = new DoctorPatientService();

  constructor() {
    super(new DoctorPatientService(), 'doctorPatient');
  }

/**********
 * 
 * Patient | Get all Patients Doctor .. 
 * 
 * ******** */
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

  // add more methods here if needed or override the existing ones 
}
