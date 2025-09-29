import catchAsync from "../../../shared/catchAsync";
import omit from "../../../shared/omit";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { GenericController } from "../../_generic-module/generic.controller";
import { IOrderItem } from "./orderItem.interface";
import { OrderItem } from "./orderItem.model";
import { OrderItemService } from "./orderItem.service";
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
      // {
      //   path: 'personId',
      //   select: 'name ' 
      // },
      // 'personId'
      // {
      //   path: 'conversationId',
      //   select: 'lastMessage updatedAt',
      //   populate: {
      //     path: 'lastMessage',
      //   }
      // }
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

    // add more methods here if needed or override the existing ones
}