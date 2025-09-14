import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { TrainingSession } from './trainingSession.model';
import { ITrainingSession } from './trainingSession.interface';
import { TrainingSessionService } from './trainingSession.service';
import catchAsync from '../../../shared/catchAsync';
import { TFolderName } from '../../../enums/folderNames';
import { AttachmentService } from '../../attachments/attachment.service';
import sendResponse from '../../../shared/sendResponse';
import { processFiles } from '../../../helpers/processFilesToUpload';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class TrainingSessionController extends GenericController<
  typeof TrainingSession,
  ITrainingSession
> {
  TrainingSessionService = new TrainingSessionService();

  constructor() {
    super(new TrainingSessionService(), 'TrainingSession');
  }

  createWithAttachments = catchAsync(async (req: Request, res: Response) => {
    const data:ITrainingSession = req.body;

    //📈⚙️ Process all file upload in parallel
    const [coverPhotos, trailerContents, attachments ] = await Promise.all([
      processFiles(req.files?.coverPhotos , TFolderName.trainingProgram),
      processFiles(req.files?.trailerContents , TFolderName.trainingProgram),
      (!data.external_link) 
      ? processFiles(req.files?.attachments, TFolderName.trainingProgram) 
      : Promise.resolve([]),
      
    ]);
    
    data.coverPhotos = coverPhotos;
    data.attachments = attachments;
    data.trailerContents = trailerContents;

    const result = await this.service.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  // --------- we move this function to helpers folder .. 
  
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
