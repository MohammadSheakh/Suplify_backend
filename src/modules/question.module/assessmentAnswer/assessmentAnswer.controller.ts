import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { AssessmentAnswer } from './assessmentAnswer.model';
import { IAssessmentAnswer } from './AssessmentAnswer.interface';
import { AssessmentAnswerService } from './assessmentAnswer.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';
import { SubscriptionPlanService } from '../../subscription.module/subscriptionPlan/subscriptionPlan.service';
import { IUser } from '../../token/token.interface';
import { ISubscriptionPlan } from '../../subscription.module/subscriptionPlan/subscriptionPlan.interface';
import { SubscriptionPlan } from '../../subscription.module/subscriptionPlan/subscriptionPlan.model';
import { TUser } from '../../user/user.interface';
import { User } from '../../user/user.model';
import { TSubscription } from '../../../enums/subscription';

export class AssessmentAnswerController extends GenericController<
  typeof AssessmentAnswer,
  IAssessmentAnswer
> {
  assessmentAnswerService = new AssessmentAnswerService();

  constructor() {
    super(new AssessmentAnswerService(), 'AssessmentAnswer');
  }

  submitAnswers = catchAsync(async (req: Request, res: Response) => {
    const { answers }: ISubmitAnswers = req.body;
    const userId = req.user.userId; // from auth middleware

    const result = await this.assessmentAnswerService.submitAnswers(
      // assessmentId, 
      userId, 
      answers
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: 'Answers submitted successfully',
      success: true,
    });
  });


  submitAnswersV2 = catchAsync(async (req: Request, res: Response) => {
    const { answers }: ISubmitAnswers = req.body;
    const userId = req.user.userId; // from auth middleware

    const { subscriptionPlanId } = req.query;
    
    if (!subscriptionPlanId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Subscription Plan ID is required in params' // TODO :  do this validation in middleware
      );
    }

    /*----------------------------

  
    let subscriptionPlan: ISubscriptionPlan | null = await SubscriptionPlan.findById(subscriptionPlanId);
    if (!subscriptionPlan) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Subscription plan not found`
        );
    }

    const user:TUser | null = await User.findById(userId);
    if (!user) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'User not found'
        );
    }

    if (user.subscriptionType !== TSubscription.none) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'User is already subscribed to a plan'
        );
    }

    ----------------------------------*/

    //---------------------

    const result = await this.assessmentAnswerService.submitAnswers(
      // assessmentId, 
      userId, 
      answers
    );

    const checkoutUrl = await new SubscriptionPlanService()
      .purchaseSubscriptionForSuplify(
        subscriptionPlanId,
        (req.user as IUser)//.userId
      );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: checkoutUrl,
      message: 'Answers submitted successfully and Redirect to Checkout',
      success: true,
    });
  
    // 🔗 Send Checkout URL to frontend
    // sendResponse(res, {
    //     code: StatusCodes.OK,
    //     data: checkoutUrl,
    //     message: `Redirect to Checkout`,
    //     success: true,
    // });

  });


  

  


    


  // add more methods here if needed or override the existing ones 
}
