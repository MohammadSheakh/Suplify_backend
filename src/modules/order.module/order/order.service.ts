import { GenericService } from "../../_generic-module/generic.services";
import { IOrder } from "./order.interface";
import { Order } from "./order.model";

export class OrderService extends GenericService<typeof Order, IOrder>{
    constructor(){
        super(Order)
    }

    async create(data:IOrder) : Promise<IOrder> {
        // console.log('req.body from generic create 🧪🧪', data);

        /*********
         * 
         * 1. We need to find out Cart is Exist or not ..
         * 2. ++ if not we return Error
         * 3. ++ if Yes We check Cart has at least 1 cartItem..
         * 4. ++++++ We Create Order [OrderStatus.pending] [PaymentStatus.unpaid] [PaymentTransactionId = null]
         * 4. ++++++ if cartItem found .. and that validates .. like available quantity found ..
         *                              we create OrderItem
         * 5. ++ we Provide Stripe URL to payment .. 
         * -----------------------------------------------------------
         * 6. If Payment Successful .. its going to WEBHOOK 
         * 7. ++++ We create Payment Transaction .. 
         * 7. ++++ We update Order [OrderStatus.completed] [PaymentStatus.paid] [PaymentTransactionId = <transaction_id>]
         * 
         * ******* */

        // return await this.model.create(data);
    }

}