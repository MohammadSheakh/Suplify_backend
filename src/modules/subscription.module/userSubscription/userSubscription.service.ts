import { GenericService } from "../../_generic-module/generic.services";
import { IUserSubscription } from "./userSubscription.interface";
import { UserSubscription } from "./userSubscription.model";


export class UserSubscriptionService extends GenericService<typeof UserSubscription, IUserSubscription>{
    constructor(){
        super(UserSubscription)
    }
}