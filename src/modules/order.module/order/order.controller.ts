import { GenericController } from "../../_generic-module/generic.controller";
import { IOrder } from "./order.interface";
import { Order } from "./order.model";
import { OrderService } from "./order.service";

export class OrderController extends GenericController<typeof Order, IOrder> {
    constructor(){
        super(new OrderService(), "Subscription")
    }
    // add more methods here if needed or override the existing ones
}