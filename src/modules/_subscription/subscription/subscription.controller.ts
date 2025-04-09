import { GenericController } from "../../__Generic/generic.controller";
import { ISubscription } from "./subscription.interface";
import { Subscription } from "./subscription.model";
import { SubscriptionService } from "./subscription.service";

export class SubscriptionController extends GenericController<typeof Subscription, ISubscription> {
    constructor(){
        super(new SubscriptionService(), "Subscription")
    }
    
}