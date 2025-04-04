import { GenericController } from "../../__Generic/generic.controller";
import { UserSubscription } from "./userSubscription.model";
import {  UserSubscriptionService } from "./userSubscription.service";

export class UserSubscriptionController extends GenericController<typeof UserSubscription> {
    constructor(){
        super(new UserSubscriptionService(), "Subscription")
    }
}