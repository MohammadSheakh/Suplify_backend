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

    let coverPhotos = []; // For cover photo .. 

    // TODO : attachments ta data er moddhe add korte hobe .. 
      
    if (req.files && req.files.coverPhotos) {
    coverPhotos.push(
        ...(await Promise.all(
        req.files.attachments.map(async file => {
            const attachmenId = await new AttachmentService().uploadSingleAttachment(
                file, // file to upload 
                TFolderName.trainingProgram, // folderName
            );
            return attachmenId;
        })
        ))
    );
    }

    let attachments = []; // For actual training session video  

    // TODO : attachments ta data er moddhe add korte hobe .. 
    
    /***********
     * 
     * external_link post korse kina check korte hobe ..
     * post na korle file upload korte hobe ...
     * 
     * ********* */  
    if(data.external)

    if (req.files && req.files.attachments) {
    attachments.push(
        ...(await Promise.all(
        req.files.attachments.map(async file => {
            const attachmenId = await new AttachmentService().uploadSingleAttachment(
                file, // file to upload 
                TFolderName.trainingProgram, // folderName
            );
            return attachmenId;
        })
        ))
    );
    }

    data.coverPhotos = coverPhotos;
    data.attachments = attachments;

    /*****
     * 
     * lets calculate this session count
     * *** */
    let sessionCount = await TrainingSession.countDocuments({
      trainingProgramId: data.trainingProgramId,
    });

    console.log('🧪 session count for program:', sessionCount);

    // data.sessionCount = sessionCount;

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
