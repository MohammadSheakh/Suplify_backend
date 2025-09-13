import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TrainingProgram } from './trainingProgram.model';
import { ITrainingProgram } from './trainingProgram.interface';
import { GenericController } from '../../_generic-module/generic.controller';
import { TrainingProgramService } from './trainingProgram.service';
import catchAsync from '../../../shared/catchAsync';
import { AttachmentService } from '../../attachments/attachment.service';
import { TFolderName } from '../../../enums/folderNames';
import sendResponse from '../../../shared/sendResponse';
import { TUser } from '../../user/user.interface';
import { IUser } from '../../token/token.interface';
import { processFiles } from '../../../helpers/processFilesToUpload';

// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class TrainingProgramController extends GenericController<
  typeof TrainingProgram,
  ITrainingProgram
> {
  TrainingProgramService = new TrainingProgramService();

  constructor() {
    super(new TrainingProgramService(), 'TrainingProgram');
  }

  createWithAttachments = catchAsync(async (req: Request, res: Response) => {
    const data:ITrainingProgram = req.body;

    data.createdBy = (req.user as IUser).userId;

    /**********
    * We need to check 
    ********** */

    
    //📈⚙️ Process both file types in parallel
    const [attachments, trailerContents] = await Promise.all([
      processFiles(req.files?.attachments, TFolderName.trainingProgram),
      processFiles(req.files?.trailerContents, TFolderName.trainingProgram)
    ]);

    data.trailerContents = trailerContents;
    data.attachments = attachments;

    const result = await this.service.create(data);

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

