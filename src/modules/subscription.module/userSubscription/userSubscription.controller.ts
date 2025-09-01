import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { GenericController } from "../../_generic-module/generic.controller";
import { IUser } from "../../token/token.interface";
import { IUserSubscription } from "./userSubscription.interface";
import { UserSubscription } from "./userSubscription.model";
import {  UserSubscriptionService } from "./userSubscription.service";
import { Request, Response } from 'express';

export class UserSubscriptionController extends GenericController<typeof UserSubscription, IUserSubscription> {
    constructor(){
        super(new UserSubscriptionService(), "Subscription")
    }

    startFreeTrial = catchAsync(async (req: Request, res: Response) => {
        const stripeCheckoutUrl = await new UserSubscriptionService().startFreeTrial((req.user as IUser)?.userId);
    })
    // add more methods here if needed or override the existing ones
}