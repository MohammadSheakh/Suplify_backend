import ApiError from "../../../errors/ApiError";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { GenericController } from "../../_generic-module/generic.controller";
import { ICreateOrder, IOrder } from "./order.interface";
import { Order } from "./order.model";
import { OrderService } from "./order.service";
import {StatusCodes} from 'http-status-codes' 

let orderService = new OrderService();

export class OrderController extends GenericController<typeof Order, IOrder> {
    constructor(){
        super(orderService, "Order")
    }

    create = catchAsync(async (req: Request, res: Response) => {

        const data = req.body as Partial<ICreateOrder>;
        const result = await orderService.createV2(data, req.user);

        sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: `${this.modelName} created successfully`,
        success: true,
        });
    });

    // add more methods here if needed or override the existing ones
}