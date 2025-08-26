import { GenericController } from "../../_generic-module/generic.controller";
import { IOrderItem } from "./orderItem.interface";
import { OrderItem } from "./orderItem.model";
import { OrderItemService } from "./orderItem.service";

export class OrderItemController extends GenericController<typeof OrderItem, IOrderItem> {
    constructor(){
        super(new OrderItemService(), "Order Item")
    }

    // add more methods here if needed or override the existing ones
}