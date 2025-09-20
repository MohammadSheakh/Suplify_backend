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
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import { User } from '../../user/user.model';
import { TrainingProgram } from '../trainingProgram/trainingProgram.model';


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

  /********
   * 
   * Specialist | Get all training session of a training program ..
   *              along with specialist information .. 
   * 
   * ******* */
  getAllWithPagination = catchAsync(async (req: Request, res: Response) => {
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const specialistId = filters.specialistId as string;
    
    // const specialistInfo = await User.findById(specialistId).select('profileImage name profileId')
    // .populate(
    //  {
    //   path: 'profileId',
    //   // select: 'name'
    //  } 
    // );

    // const trainingProgramInfo = await TrainingProgram.findById(filters.trainingProgramId).select('title');

    const [specialistInfo, trainingProgramInfo] = await Promise.all([
      User.findById(specialistId)
        .select('profileImage name profileId')
        .populate({
          path: 'profileId',
          // select: 'name'
        }),

      TrainingProgram.findById(filters.trainingProgramId)
        .select('programName totalSessionCount') // ISSUE : totalSessionCount calculation has serious issue .. 
    ]);

    // now remove it from filters so it won’t be used later
    delete filters.specialistId;

    const populateOptions: (string | {path: string, select: string}[]) = [
      {
        path: 'attachments',
        select: '-__v -updatedAt -createdAt' 
      },
    ];

    const select = '-__v -updatedAt -createdAt -isDeleted'; 

    const result = await this.service.getAllWithPagination(filters, options, populateOptions, select);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: {
        result, specialistInfo, trainingProgramInfo
      },
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });


  // add more methods here if needed or override the existing ones 
}
