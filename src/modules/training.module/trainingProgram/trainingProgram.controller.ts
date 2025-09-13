//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { TrainingProgram } from './trainingProgram.model';
import { ITrainingProgram } from './trainingProgram.interface';
import { GenericController } from '../../_generic-module/generic.controller';
import  eventEmitForUpdateSpecialistUserProfile, { TrainingProgramService } from './trainingProgram.service';
import catchAsync from '../../../shared/catchAsync';
import { TFolderName } from '../../../enums/folderNames';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';
import { processFiles } from '../../../helpers/processFilesToUpload';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import { User } from '../../user/user.model';

// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class TrainingProgramController extends GenericController<
  typeof TrainingProgram,
  ITrainingProgram
> {
  trainingProgramService = new TrainingProgramService();

  constructor() {
    super(new TrainingProgramService(), 'TrainingProgram');
  }

  /***********
   * 
   * Patient | Get all Training Program of a Specialist ..
   * ⚠️ need to add aggregation  
   * ********* */
  getAllWithAggregation = catchAsync(async (req: Request, res: Response) => {
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const result = await this.trainingProgramService.getAllWithAggregation(filters, options, req.user.userId);

    // get specialist information

    const specialistInfo = await User
            .findById(filters.createdBy)
            .select('profileImage name profileId')
            .populate({
                path: 'profileId', 
                select: 'description protocolNames howManyPrograms'
            });

    sendResponse(res, {
      code: StatusCodes.OK,
      data: {
        result,
        specialistInfo
      },
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  createWithAttachments = catchAsync(async (req: Request, res: Response) => {
    const data:ITrainingProgram = req.body;

    data.createdBy = (req.user as IUser).userId;
    /**********
     * // TODO : We need to check Specialist is approved by admin or not
    ********** */

    //📈⚙️ Process both file types in parallel
    const [attachments, trailerContents] = await Promise.all([
      processFiles(req.files?.attachments, TFolderName.trainingProgram),
      processFiles(req.files?.trailerContents, TFolderName.trainingProgram)
    ]);

    data.trailerContents = trailerContents;
    data.attachments = attachments;

    const result = await this.service.create(data);

    //📈⚙️ update userProfile's howmanyPrograms count in 
    eventEmitForUpdateSpecialistUserProfile.emit('eventEmitForUpdateSpecialistUserProfile', (req.user as IUser).userId);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  // TODO : Remove this Function --------- we move this function to helpers folder ..

  // private async processFiles(files: any[], folderName: TFolderName): Promise<string[]> {
  //   if (!files || files.length === 0) return [];
    
  //   // All files upload in parallel
  //   const uploadPromises = files.map(file => 
  //     new AttachmentService().uploadSingleAttachment(file, folderName)
  //   );
    
  //   return await Promise.all(uploadPromises);
  // }

  // add more methods here if needed or override the existing ones 
}

