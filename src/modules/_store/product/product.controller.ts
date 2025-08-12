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
  productService = new ProductService();

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

    data.attachments = attachments;

    data.price = parseInt(data.price);

    const result = await this.service.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });



  getAllWithPagination = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const populateOptions: (string | {path: string, select: string}[]) = [
      // {
      //   path: 'personId',
      //   select: 'name ' 
      // },
      // 'personId'
      // {
      //   path: 'siteId',
      //   select: ''
      // }
    ];

    const select = ''; 

    const result = await this.service.getAllWithPagination(filters, options, populateOptions, select);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });




  categoryWithCount = catchAsync(async (req: Request, res: Response) => {
    const result = await this.productService.categoryWithCount();
    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} categories with count retrieved successfully`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
