import { GenericService } from "../../_generic-module/generic.services";
import { IOrderItem } from "./orderItem.interface";
import { OrderItem} from "./orderItem.model";

export class OrderItemService extends GenericService<typeof OrderItem, IOrderItem>{
    constructor(){
        super(OrderItem)
    }
}