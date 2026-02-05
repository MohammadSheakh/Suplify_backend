//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { RequestForViseSubscriptionToAdmin } from './requestForViseSubscriptionToAdmin.model';
import { IRequestForViseSubscriptionToAdmin } from './requestForViseSubscriptionToAdmin.interface';
import { RequestForViseSubscriptionToAdminService } from './requestForViseSubscriptionToAdmin.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { ISpecialistPatient } from '../specialistPatient/specialistPatient.interface';
import { SpecialistPatient } from '../specialistPatient/specialistPatient.model';
import { THireStatus } from './requestForViseSubscriptionToAdmin.constant';
import { TRelationCreatedBy } from '../doctorSpecialistPatient/doctorSpecialistPatient.constant';
import ApiError from '../../../errors/ApiError';
import { enqueueWebNotification } from '../../../services/notification.service';
import { TRole } from '../../../middlewares/roles';
import { TNotificationType } from '../../notification/notification.constants';
import { User } from '../../user/user.model';
import { IUser } from '../../user/user.interface';
import { TSubscription } from '../../../enums/subscription';
import { SubscriptionPlanService } from '../../subscription.module/subscriptionPlan/subscriptionPlan.service';

export class RequestForViseSubscriptionToAdminController extends GenericController<
  typeof RequestForViseSubscriptionToAdmin,
  IRequestForViseSubscriptionToAdmin
> {
  RequestForViseSubscriptionToAdminService = new RequestForViseSubscriptionToAdminService();

  subscriptionPlanService = new SubscriptionPlanService();


  constructor() {
    super(new RequestForViseSubscriptionToAdminService(), 'RequestForViseSubscriptionToAdmin');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const data :ISpecialistPatient = req.body;

    // check if already assigned
    const existing = await RequestForViseSubscriptionToAdmin.findOne({
      patientId: req.user.userId
    }).lean();

    if(existing) {
      return sendResponse(res, {
        code: StatusCodes.OK,
        data: existing,
        message: `You already request for vise subscription.`,
        success: true,
      });
    }

    const hireSpecialistDTO = {
      patientId: req.user.userId
    }

    const result = await this.service.create(hireSpecialistDTO);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  // 🏃‍➡️ -> MOVE_TO_SERVICE
  // admin can change status .. and based on status we update patients subscription
  // to vise subscription

  // check status .. if status == approved
  // get users current subscription

  changeStatus = catchAsync(async (req: Request, res: Response) => {
    const status = req.body.status;

    const viseSubscriptionRequestId = req.params.viseSubscriptionRequestId

    // first get the original status .. and check object is aviable or not
    const isObjectExist:IRequestForViseSubscriptionToAdmin = await RequestForViseSubscriptionToAdmin.findById(viseSubscriptionRequestId);
    
    if(!isObjectExist){
      throw new ApiError(StatusCodes.NOT_FOUND, 'RequestForViseSubscriptionToAdmin Object not found');
    }

    if(status == THireStatus.approved){
      // first check patients current subscription
      const isUserFound:IUser = await User.findOne({
       _id : isObjectExist.patientId,
      })

      if(isUserFound){
        // user is found so .. we now check users current subscription

        if(isUserFound.subscriptionType == TSubscription.vise){
          sendResponse(res, {
            code: StatusCodes.OK,
            data: null,
            message: `This Person already have vise subscription`,
            success: true,
          });
        }else if (isUserFound.subscriptionType == TSubscription.standard){
          
          this.subscriptionPlanService.cancelPatientsSubscriptionAndAssignViseSubscription(req.user.userId, isObjectExist.patientId);

          sendResponse(res, {
            code: StatusCodes.OK,
            data: null,
            // message: `He need to cancel his standard subscription first.`,
            message: `Standard subscription will cancel at the end of the billing cycle And Vice Subscription is successfully assigned.`,
            success: true,
          });
        }else if(isUserFound.subscriptionType == TSubscription.standardPlus){

          this.subscriptionPlanService.cancelPatientsSubscriptionAndAssignViseSubscription(req.user.userId, isObjectExist.patientId);

          sendResponse(res, {
            code: StatusCodes.OK,
            data: null,
            // message: `He need to cancel his standardPlus subscription first.`,
            message: `StandardPlus subscription will cancel at the end of the billing cycle And Vice Subscription is successfully assigned.`,
            success: true,
          });
        }else if (isUserFound.subscriptionType == TSubscription.freeTrial){
          sendResponse(res, {
            code: StatusCodes.OK,
            data: null,
            message: `He is in free trial now.`,
            success: true,
          });
        }else if (isUserFound.subscriptionType == TSubscription.none){

          // update users subscription
          const updatedUser:IUser = User.findByIdAndUpdate(
            isObjectExist.patientId,
            {
                subscriptionType : TSubscription.vise,
            },
            {
              new : true,
            }
          )


          const updatedObject =  await RequestForViseSubscriptionToAdmin.findByIdAndUpdate(
            viseSubscriptionRequestId,
            {
              status : THireStatus.approved,
            },
            {
              new: true,
            }
          )
          
        }
      }


      // TODO 
      //------- Send notification to patient that .. Admin Approved That Specialist for you

      await enqueueWebNotification(
        `Request for vise subscription is approved by admin`,
        req.user.userId, // senderId
        isObjectExist.patientId, // receiverId
        TRole.patient, // receiverRole
        TNotificationType.system, // type
        //---------------------------------
        // In UI there is no details page for specialist's schedule
        //---------------------------------

        // '', // linkFor
        // existingWorkoutClass._id // linkId
      );

      sendResponse(res, {
        code: StatusCodes.OK,
        data: isActualRelationExist,
        message: `Status updated.`,
        success: true,
      });

    }else if (status == THireStatus.pending){
      sendResponse(res, {
        code: StatusCodes.OK,
          data: null,
          message: `Status updated.`,
          success: true,
        });
    }else if (status == THireStatus.rejected){

      await RequestForViseSubscriptionToAdmin.findByIdAndUpdate(
        viseSubscriptionRequestId,
        {
          status: THireStatus.rejected,
        },
        { new : true}
      )

      // TODO 
      //------- Send notification to patient that .. Admin Reject That Specialist for you

      await enqueueWebNotification(
          `Request for vise subscription is rejected by admin`,
          req.user.userId, // senderId
          isObjectExist.patientId, // receiverId
          TRole.patient, // receiverRole
          TNotificationType.system, // type
          //---------------------------------
          // In UI there is no details page for specialist's schedule
          //---------------------------------

          // '', // linkFor
          // existingWorkoutClass._id // linkId
      );

      sendResponse(res, {
        code: StatusCodes.OK,
          data: null,
          message: `Status is updated.`,
          success: true,
        });
    }



    sendResponse(res, {
      code: StatusCodes.OK,
      data: null,
      message: `--`,
      success: true,
    });
  });

  cancelViseSubscription = catchAsync(async (req: Request, res: Response) => {
    // const status = req.body.status;

    const viseSubscriptionRequestId = req.params.viseSubscriptionRequestId

    // first get the original status .. and check object is aviable or not
    const isObjectExist:IRequestForViseSubscriptionToAdmin = await RequestForViseSubscriptionToAdmin.findById(viseSubscriptionRequestId);
    
    if(!isObjectExist){
      throw new ApiError(StatusCodes.NOT_FOUND, 'RequestForViseSubscriptionToAdmin Object not found');
    }

    if(isObjectExist.status != THireStatus.approved){
      return sendResponse(res, {
        code: StatusCodes.OK,
        data: null,
        message: `You can not change this persons status`,
        success: true,
      });
    }

    
    // first check patients current subscription
    const isUserFound:IUser = await User.findOne({
      _id : isObjectExist.patientId,
    })

    if(!isUserFound){
      return sendResponse(res, {
        code: StatusCodes.OK,
        data: null,
        message: `User not found !`,
        success: true,
      });
    }
    // user is found so .. we now check users current subscription

    if(isUserFound.subscriptionType == TSubscription.vise){


      // update users subscription
      const updatedUser:IUser = User.findByIdAndUpdate(
        isObjectExist.patientId,
        {
            subscriptionType : TSubscription.none,
        },
        {
          new : true,
        }
      )

      await enqueueWebNotification(
        `Your subscription is changed back to none by admin`,
        req.user.userId, // senderId
        isObjectExist.patientId, // receiverId
        TRole.patient, // receiverRole
        TNotificationType.system, // type
        //---------------------------------
        // In UI there is no details page for specialist's schedule
        //---------------------------------

        // '', // linkFor
        // existingWorkoutClass._id // linkId
      );

      await RequestForViseSubscriptionToAdmin.findByIdAndDelete(viseSubscriptionRequestId);

      return sendResponse(res, {
        code: StatusCodes.OK,
        data: null,
        message: `This Persons subscription is changed to none`,
        success: true,
      });
    }

    sendResponse(res, {
        code: StatusCodes.OK,
        data: null,
        message: `This Person have no vise subscription`,
        success: true,
    });

  })

  // add more methods here if needed or override the existing ones 
}
