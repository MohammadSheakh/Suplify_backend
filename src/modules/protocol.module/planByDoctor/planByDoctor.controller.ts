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


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

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


  // add more methods here if needed or override the existing ones 
}
