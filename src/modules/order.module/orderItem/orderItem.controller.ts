import catchAsync from "../../../shared/catchAsync";
import omit from "../../../shared/omit";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { GenericController } from "../../_generic-module/generic.controller";
import { Order } from "../order/order.model";
import { IOrderItem } from "./orderItem.interface";
import { OrderItem } from "./orderItem.model";
import { OrderItemService } from "./orderItem.service";
//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';


export class OrderItemController extends GenericController<typeof OrderItem, IOrderItem> {
    constructor(){
        super(new OrderItemService(), "Order Item")
    }

  getAllWithPaginationForPatient = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    

    const populateOptions: (string | {path: string, select: string}[]) = [
      {
        path: 'itemId',
        select: 'name attachments',
        populate: {
          path: 'attachments',
          select: 'attachment'
        }
      },
    ];

    const select = '-isDeleted -createdAt -updatedAt -__v'; 

    const result = await this.service.getAllWithPagination(filters, options, populateOptions , select );

    const orderInfo = await Order.findOne({
      _id: filters.orderId
    }).select('-isDeleted -createdAt -updatedAt -__v').lean();

    result.orderInfo = orderInfo

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  //------------------------------
  // Admin | Get all order item along with shipping address for a orderId
  //------------------------------
  getAll = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderItem.find({
      orderId: req.query.orderId
    }).select('-isDeleted -createdAt -updatedAt -__v').populate({
        path: 'itemId',
        select: 'name attachments',
        populate: {
          path: 'attachments',
          select: 'attachment'
        }
      }).lean();

    const orderInfo = await Order.findOne({
      _id: req.query.orderId
    }).select('-isDeleted  -updatedAt -__v').populate({
      path: 'userId',
      select: 'name'
    }).lean(); //-createdAt

    sendResponse(res, {
      code: StatusCodes.OK,
      data: {
        result,
        orderInfo
      },
      message: `All ${this.modelName}s`,
      success: true,
    });
  });

    // add more methods here if needed or override the existing ones
}