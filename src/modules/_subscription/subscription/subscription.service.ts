import { GenericService } from "../../__Generic/generic.services";
import { Subscription } from "./subscription.model";

export class SubscriptionService extends GenericService<typeof Subscription>{
    constructor(){
        super(Subscription)
    }
}