import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { Product } from './product.model';
import { IProduct } from './product.interface';
import { ProductService } from './product.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AttachmentService } from '../../attachments/attachment.service';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import { TFolderName } from '../../../enums/folderNames';
import { getOrSetRedisCache } from '../../../helpers/redis/getOrSetRedisCache';

export class ProductController extends GenericController<
  typeof Product,
  IProduct
> {
  productService = new ProductService();

  constructor() {
    super(new ProductService(), 'Product');
  }

  //---------------------------------
  // (Admin) : E-Commerce
  //---------------------------------
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

    filters.isDeleted = false;

    const populateOptions: (string | {path: string, select: string}[]) = [
      {
        path: 'attachments',
        select: 'attachmentType attachment' 
      },
    ];

    const select = '-createdAt -updatedAt -__v'; 

    // Only cache page 1 with standard limit
    const shouldCache = (!options.page || options.page === '1') && 
                      (!options.limit || parseInt(options.limit) <= 20);
    
    if (shouldCache) {
      // Create cache key based on filters and sort
      const cacheKey = `products_page1_${JSON.stringify(filters)}_${options.sortBy || 'default'}`;
      
      const result = await getOrSetRedisCache(
        cacheKey,
        async () => {
          return this.service.getAllWithPagination(filters, options, populateOptions, select);
        },
        1800, // 30 minutes TTL
        false
      );
      
      return sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: `All ${this.modelName} with pagination`,
        success: true,
      });
    }


    const result = await this.service.getAllWithPagination(filters, options, populateOptions, select);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  categoryWithCount = catchAsync(async (req: Request, res: Response) => {
    // const result = await this.productService.categoryWithCount();

    // await redisClient.del("productCategoryWithCount");

    const result = await getOrSetRedisCache(
      'productCategoryWithCount',
      async () => {
        return this.productService.categoryWithCount_WithoutCaching();
      },
      3600, // 1 hour TTL
      false
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} categories with count retrieved successfully`,
      success: true,
    });
  });


  //---------------------------------
  // (Landing Page) : E-Commerce 
  //---------------------------------
  showAllCategoryAndItsLimitedProducts = catchAsync(async (req: Request, res: Response) => {
    // const result = await this.productService.showAllCategoryAndItsLimitedProducts();

    const result = await getOrSetRedisCache(
      `showAllCategoryAndItsLimitedProducts`,
      async () => {
        return this.productService.showAllCategoryAndItsLimitedProducts();
      },
      3600, // 1 hour TTL
      false
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} categories with limited products retrieved successfully`,
      success: true,
    });
  });


//---------------------------------
// ( Landing Page ) |  get-product-details-with-related-products  //[][🧑‍💻][🧪] //🚧✅ 🆗
//---------------------------------
  getProductDetailsWithRelatedProducts = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    // const result = await this.productService.getProductDetailsWithRelatedProducts(productId);

    const result = await getOrSetRedisCache(
      `product:${productId}`,
      async () => {
        return this.productService.getProductDetailsWithRelatedProducts(productId);
      },
      120, // 120 seconds = 2 minute
      true
    );


    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} details with related products retrieved successfully`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
