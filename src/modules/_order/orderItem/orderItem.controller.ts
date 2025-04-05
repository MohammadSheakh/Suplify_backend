import { GenericController } from "../../__Generic/generic.controller";
import { OrderItem } from "./orderItem.model";
import { OrderItemService } from "./orderItem.service";

export class OrderItemController extends GenericController<typeof OrderItem> {
    constructor(){
        super(new OrderItemService(), "Order Item")
    }
    
}