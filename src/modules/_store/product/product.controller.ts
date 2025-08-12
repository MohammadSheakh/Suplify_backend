import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../__Generic/generic.controller';
import { Product } from './product.model';
import { IProduct } from './product.interface';
import { ProductService } from './product.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TFolderName } from '../../attachments/attachment.constant';
import { AttachmentService } from '../../attachments/attachment.service';


// let conversationParticipantsService = new ConversationParticipentsService();
// let messageService = new MessagerService();

export class ProductController extends GenericController<
  typeof Product,
  IProduct
> {
  ProductService = new ProductService();

  constructor() {
    super(new ProductService(), 'Product');
  }

  /***********
   * 
   * (Admin) : E-Commerce
   * 
   * ******** */
  create = catchAsync(async (req: Request, res: Response) => {
    const data: IProduct = req.body;

    let attachments = [];
      
    if (req.files && req.files.attachments) {
    attachments.push(
        ...(await Promise.all(
        req.files.attachments.map(async file => {
            const attachmenId = await new AttachmentService().uploadSingleAttachment(
                file, // file to upload 
                TFolderName.shop, // folderName
            );
            return attachmenId;
        })
        ))
    );
    }

    data.price = parseInt(data.price);

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
