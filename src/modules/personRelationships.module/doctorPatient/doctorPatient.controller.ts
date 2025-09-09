import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { doctorPatient } from './doctorPatient.model';
import { IdoctorPatient } from './doctorPatient.interface';
import { doctorPatientService } from './doctorPatient.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class doctorPatientController extends GenericController<
  typeof doctorPatient,
  IdoctorPatient
> {
  doctorPatientService = new doctorPatientService();

  constructor() {
    super(new doctorPatientService(), 'doctorPatient');
  }

  getAllWithPagination = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const populateOptions: (string | {path: string, select: string}[]) = [
      {
        path: 'doctorId',
        select: 'name profileImage personId',
        populate:{
          path: 'personId',
          select: 'description'
        }
      },
      // 'personId'
      
    ];

    // const select = ''; 

    const result = await this.service.getAllWithPagination(filters, options, populateOptions/*, select*/);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
