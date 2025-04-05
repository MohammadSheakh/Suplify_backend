import { GenericController } from "../../__Generic/generic.controller";
import { Order } from "./order.model";
import { OrderService } from "./order.service";

export class OrderController extends GenericController<typeof Order> {
    constructor(){
        super(new OrderService(), "Subscription")
    }
}