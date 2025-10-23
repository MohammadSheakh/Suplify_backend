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
import ApiError from '../../../errors/ApiError';


export class TrainingProgramController extends GenericController<
  typeof TrainingProgram,
  ITrainingProgram
> {
  trainingProgramService = new TrainingProgramService();

  constructor() {
    super(new TrainingProgramService(), 'TrainingProgram');
  }

  //---------------------------------
  // Patient | Get all Training Program of a Specialist ..
  // 📈⚙️ OPTIMIZATION:
  //---------------------------------
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
    //---------------------------------
    // TODO : We need to check Specialist is approved by admin or not
    //---------------------------------

    //📈⚙️ OPTIMIZATION: Process both file types in parallel
    const [attachments, trailerContents] = await Promise.all([
      processFiles(req.files?.attachments, TFolderName.trainingProgram),
      processFiles(req.files?.trailerContents, TFolderName.trainingProgram)
    ]);

    data.trailerContents = trailerContents;
    data.attachments = attachments;

    const result = await this.service.create(data);

    //📈⚙️ OPTIMIZATION: update userProfile's howmanyPrograms count in 
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


//---------------------------------
// Specialist | Get all Training Program of a Specialist .. 
//---------------------------------
  getAllWithPagination = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    // only get logged in specialist's training program
    filters.createdBy = (req.user as IUser).userId;

    const populateOptions: (string | {path: string, select: string}[]) = [
      {
        path: 'trailerContents attachments',
        select: '-__v -updatedAt -createdAt' 
      },
      // 'personId'
      // {
      //   path: '', 
      //   select: '',
      //   populate: {
      //     path: '',
      //   }
      // }
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

  //---------------------------------
  // Specialist | Update Training Program with attachments
  //---------------------------------
  updateById = catchAsync(async (req: Request, res: Response) => {
    if (!req.params.id) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `id is required for update ${this.modelName}`
      );
    }
    
    const id = req.params.id;

    const obj : ITrainingProgram | null = await this.service.getById(id);
    if (!obj) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Object with ID ${id} not found`
      );
    }
   
    // for update cases .. if image uploaded then we use that uploaded image url otherwise we use previous one
    if(req.uploadedFiles?.attachments.length > 0){
      console.log('req.uploadedFiles?.attachments.length > 0 .. replace prev image with the new one');
      req.body.attachments = req.uploadedFiles?.attachments;
    }else{
      console.log('req.uploadedFiles?.attachments.length == 0 .. keep prev image');
      req.body.attachments = obj.attachments;
    }

    // ✅ Use preprocessed uploaded file URLs //🥇🔁 this task we do in middleware level for create API not for update API
    // req.body.attachments = req.uploadedFiles?.attachments || [];
    // req.body.trailerContents = req.uploadedFiles?.trailerContents || [];

    const updatedObject = await this.service.updateById(id, req.body);
    if (!updatedObject) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Object with ID ${id} not found`
      );
    }

    //   return res.status(StatusCodes.OK).json(updatedObject);
    sendResponse(res, {
      code: StatusCodes.OK,
      data: updatedObject,
      message: `${this.modelName} updated successfully`,
    });
  });

  // add more methods here if needed or override the existing ones 
}

