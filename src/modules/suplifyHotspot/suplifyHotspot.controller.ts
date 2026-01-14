//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../_generic-module/generic.controller';
import { SuplifyHotspot } from './suplifyHotspot.model';
import { ISuplifyHotspot } from './suplifyHotspot.interface';
import { SuplifyHotspotService } from './suplifyHotspot.service';
import { TFolderName } from '../../enums/folderNames';
import { AttachmentService } from '../attachments/attachment.service';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import ApiError from '../../errors/ApiError';

export class SuplifyHotspotController extends GenericController<
  typeof SuplifyHotspot,
  ISuplifyHotspot
> {
  SuplifyHotspotService = new SuplifyHotspotService();

  constructor() {
    super(new SuplifyHotspotService(), 'SuplifyHotspot');
  }

  createWithAttachments = catchAsync(async (req: Request, res: Response) => {
    const data = req.body;

    let attachments = [];
      
    if (req.files && req.files.attachments) {
      attachments.push(
          ...(await Promise.all(
          req.files.attachments.map(async file => {
              const attachmenId = await new AttachmentService().uploadSingleAttachment(
                  file, // file to upload 
                  TFolderName.hotspot, // folderName
              );
              return attachmenId;
          })
          ))
      );
    }

    data.attachments = attachments;

    const result = await this.service.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  updateWithImageById = catchAsync(async (req: Request, res: Response) => {

    if (!req.params.id) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `id is required for update ${this.modelName}`
      );
    }
    
    const id = req.params.id;

    const existingObject = await this.service.getById(id);

    // TODO : proper type needs to be pass here... 
    const existingObjectDTO : any = {
      attachments : req.uploadedFiles.attachments?.[0] ?? existingObject?.attachments,
      ...req.body
    }

    //const updatedObject = await this.service.updateById(id, /*req.body*/ existingObjectDTO);
    
    const updatedObject = await this.service.updateByIdWithPopulateTestingPurpose(id, /*req.body*/ existingObjectDTO, [
      {
        path: "attachments",
        select: "attachment"
      }
    ]);
    
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
