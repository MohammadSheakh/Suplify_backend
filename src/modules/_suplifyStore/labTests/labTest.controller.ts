import { GenericController } from "../../__Generic/generic.controller";
import { Order } from "./labTest.model";
import { OrderService } from "./labTest.service";

export class LabTestController extends GenericController<typeof LabTest> {
    constructor(){
        super(new OrderService(), "Subscription")
    }

    // add more methods here if needed or override the existing ones
}