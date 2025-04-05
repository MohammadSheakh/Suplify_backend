import { GenericService } from "../../__Generic/generic.services";
import { Order } from "./order.model";

export class OrderService extends GenericService<typeof Order>{
    constructor(){
        super(Order)
    }
}