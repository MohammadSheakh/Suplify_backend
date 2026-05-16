import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../_generic-module/generic.controller';
import { ClientDocuments } from './clientDocuments.model';
import { IClientDocuments } from './ClientDocuments.interface';
import { ClientDocumentsService } from './clientDocuments.service';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { TFolderName } from '../../enums/folderNames';
import { processFiles } from '../../helpers/processFilesToUpload';
import { IUser } from '../token/token.interface';

export class ClientDocumentsController extends GenericController<
  typeof ClientDocuments,
  IClientDocuments
> {
  ClientDocumentsService = new ClientDocumentsService();

  constructor() {
    super(new ClientDocumentsService(), 'ClientDocuments');
  }


  createWithAttachments = catchAsync(async (req: Request, res: Response) => {
    const data:IClientDocuments = req.body;

    data.patientId = (req.user as IUser).userId;
    

    //📈⚙️ OPTIMIZATION: Process both file types in parallel
    const [attachments] = await Promise.all([
      processFiles(req.files?.attachments, TFolderName.common),
    ]);

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
