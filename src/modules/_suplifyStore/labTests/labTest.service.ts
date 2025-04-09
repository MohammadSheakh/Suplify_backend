import { GenericService } from "../../__Generic/generic.services";
import { Order } from "./labTest.model";

// 🔥🔥 Issue .. 
export class OrderService extends GenericService<typeof Order>{
    constructor(){
        super(Order)
    }
}