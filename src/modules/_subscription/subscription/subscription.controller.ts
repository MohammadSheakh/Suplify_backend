import { GenericController } from "../../__Generic/generic.controller";
import { Subscription } from "./subscription.model";
import { SubscriptionService } from "./subscription.service";

export class SubscriptionController extends GenericController<typeof Subscription> {
    constructor(){
        super(new SubscriptionService(), "Subscription")
    }
    
}