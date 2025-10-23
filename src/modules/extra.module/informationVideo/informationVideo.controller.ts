import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { informationVideo } from './informationVideo.model';
import { IinformationVideo } from './informationVideo.interface';
import { informationVideoService } from './informationVideo.service';
import { processFiles } from '../../../helpers/processFilesToUpload';
import { TFolderName } from '../../../enums/folderNames';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import { TUser } from '../../user/user.interface';
import { IUser } from '../../token/token.interface';
import { TSubscription } from '../../../enums/subscription';
import ApiError from '../../../errors/ApiError';


export class informationVideoController extends GenericController<
  typeof informationVideo,
  IinformationVideo
> {
  informationVideoService = new informationVideoService();

  constructor() {
    super(new informationVideoService(), 'informationVideo');
  }

  createWithAttachments = catchAsync(async (req: Request, res: Response) => {
    
    const data:IinformationVideo = req.body;
  
    //📈⚙️ OPTIMIZATION: Process all file upload in parallel
    const [thumbnail, video ] = await Promise.all([
      
      (!data.videoLink) 
      ? processFiles(req.files?.thumbnail , TFolderName.informationVideo)
      : Promise.resolve([]),

      (!data.videoLink) 
      ? processFiles(req.files?.video , TFolderName.informationVideo)
      : Promise.resolve([]),
    ]);

    data.thumbnail = thumbnail;
    data.video = video;

    data.createdBy = (req.user as any).userId;


    const result = await this.service.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  //---------------------------------
  // Specialist | Update Information Video with attachments
  //---------------------------------
  updateById = catchAsync(async (req: Request, res: Response) => {
    if (!req.params.id) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `id is required for update ${this.modelName}`
      );
    }
    
    const id = req.params.id;

    const obj:IinformationVideo | null = await this.service.getById(id);
    if (!obj) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Object with ID ${id} not found`
      );
    }
   
    // for update cases .. if image uploaded then we use that uploaded image url otherwise we use previous one
    if(req.uploadedFiles?.thumbnail.length > 0){
      console.log('req.uploadedFiles?.attachments.length > 0 .. replace prev image with the new one');
      req.body.thumbnail = req.uploadedFiles?.thumbnail;
    }else{
      console.log('req.uploadedFiles?.attachments.length == 0 .. keep prev image');
      req.body.thumbnail = obj.thumbnail;
    }

    if(req.uploadedFiles?.video.length > 0){
      req.body.video = req.uploadedFiles?.video;
    }else{
      console.log('req.uploadedFiles?.attachments.length == 0 .. keep prev image');
      req.body.video = obj.video;
    }

    
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


  //---------------------------------
  // Specialist | 
  //---------------------------------
  getAllWithPagination = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    

    const populateOptions: (string | {path: string, select: string}[]) = [
      {
        path: 'video',
        select: 'attachment attachmentType' 
      },
      // 'personId'
      {
        path: 'thumbnail',
        select: 'attachment attachmentType',
        // populate: {
        //   path: '',
        // }
      }
    ];

    const select = '-isDeleted -createdAt -updatedAt -__v'; 

    const result = await this.service.getAllWithPagination(filters, options, populateOptions , select );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });


  //---------------------------------
  // Patient | Landing Page | Information video  
  // only subscription -> (standard  + above) patient can view the video
  //---------------------------------

  getAllWithPaginationForPatient = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const populateOptions: (string | {path: string, select: string}[]) = [];
    // const select = ''; 

    let result = null;
    if(req.user && (req.user as IUser).subscriptionPlan != TSubscription.none){

      result = await this.service.getAllWithPagination(filters, options, populateOptions/*, select*/);

    }else{
      result = null;
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });


  
  // add more methods here if needed or override the existing ones 
}
