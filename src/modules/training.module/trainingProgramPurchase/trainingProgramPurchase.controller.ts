import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { TrainingProgramPurchase } from './trainingProgramPurchase.model';
import { ITrainingProgramPurchase } from './trainingProgramPurchase.interface';
import { TrainingProgramPurchaseService } from './trainingProgramPurchase.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';


export class TrainingProgramPurchaseController extends GenericController<
  typeof TrainingProgramPurchase,
  ITrainingProgramPurchase
> {
  trainingProgramPurchaseService = new TrainingProgramPurchaseService();

  constructor() {
    super(new TrainingProgramPurchaseService(), 'TrainingProgramPurchase');
  }

  /******
   * 
   * patient | purchase training program
   * 
   * ****** */
  create = catchAsync(async (req: Request, res: Response) => {
    
    // const data:ITrainingProgramPurchase = req.body;
    
    console.log("1️⃣")

    const result = await this.trainingProgramPurchaseService.createV2(req.params.trainingProgramId, req.user as IUser);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });



  // add more methods here if needed or override the existing ones 
}
