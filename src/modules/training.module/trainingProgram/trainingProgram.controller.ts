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

    let attachments = [];
      
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

    let trailerContents = [];

    if (req.files && req.files.trailerContents) {
    trailerContents.push(
        ...(await Promise.all(
        req.files.trailerContents.map(async file => {
            const attachmenId = await new AttachmentService().uploadSingleAttachment(
                file, // file to upload 
                TFolderName.trainingProgram, // folderName
            );
            return attachmenId;
        })
        ))
    );
    }

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


  // add more methods here if needed or override the existing ones 
}
