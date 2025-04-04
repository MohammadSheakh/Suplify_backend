import { GenericService } from "../../__Generic/generic.services";
import { UserSubscription } from "./userSubscription.model";


export class UserSubscriptionService extends GenericService<typeof UserSubscription>{
    constructor(){
        super(UserSubscription)
    }
}