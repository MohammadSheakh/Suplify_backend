import { GenericService } from "../../__Generic/generic.services";
import { OrderItem} from "./orderItem.model";

export class OrderItemService extends GenericService<typeof OrderItem>{
    constructor(){
        super(OrderItem)
    }
}