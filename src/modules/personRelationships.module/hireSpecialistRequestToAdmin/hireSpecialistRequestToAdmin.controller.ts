//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { HireSpecialistRequestToAdmin } from './hireSpecialistRequestToAdmin.model';
import { IHireSpecialistRequestToAdmin } from './hireSpecialistRequestToAdmin.interface';
import { HireSpecialistRequestToAdminService } from './hireSpecialistRequestToAdmin.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { ISpecialistPatient } from '../specialistPatient/specialistPatient.interface';
import { SpecialistPatient } from '../specialistPatient/specialistPatient.model';
import { THireStatus } from './hireSpecialistRequestToAdmin.constant';
import { TRelationCreatedBy } from '../doctorSpecialistPatient/doctorSpecialistPatient.constant';
import ApiError from '../../../errors/ApiError';
import { enqueueWebNotification } from '../../../services/notification.service';
import { TRole } from '../../../middlewares/roles';
import { TNotificationType } from '../../notification/notification.constants';

export class HireSpecialistRequestToAdminController extends GenericController<
  typeof HireSpecialistRequestToAdmin,
  IHireSpecialistRequestToAdmin
> {
  HireSpecialistRequestToAdminService = new HireSpecialistRequestToAdminService();

  constructor() {
    super(new HireSpecialistRequestToAdminService(), 'HireSpecialistRequestToAdmin');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const data :ISpecialistPatient = req.body;

    // check if already assigned
    const existing = await HireSpecialistRequestToAdmin.findOne({
      patientId: req.user.userId,
      specialistId: data.specialistId
    }).lean();

    if(existing) {
      return sendResponse(res, {
        code: StatusCodes.OK,
        data: existing,
        message: `You already request for this specialist.`,
        success: true,
      });
    }

    const hireSpecialistDTO = {
      patientId: req.user.userId,
      specialistId: data.specialistId
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
  // admin can change status .. and based on status we create create or remove 
  // specialist patient relation
  changeStatus = catchAsync(async (req: Request, res: Response) => {
    const status = req.body.status;

    const hireSpecialsitRequestToAdminId = req.params.hireSpecialistId

    // first get the original status .. and check object is aviable or not
    const isObjectExist:IHireSpecialistRequestToAdmin =  await HireSpecialistRequestToAdmin.findById(hireSpecialsitRequestToAdminId);
    if(!isObjectExist){
      throw new ApiError(StatusCodes.NOT_FOUND, 'HireSpecialistRequestToAdmin Object not found');
    }

    if(status == THireStatus.approved){
      // first check relation is already there or not
      const isActualRelationExist = await SpecialistPatient.findOne({
        patientId : isObjectExist.patientId,
        specialistId : isObjectExist.specialistId,
        isDeleted : false,
      })

    
      if(isActualRelationExist){
        // if relation exist .. 
        //---- send immediate response ..  
        sendResponse(res, {
        code: StatusCodes.OK,
          data: isActualRelationExist,
          message: `Specialist already assigned to this patient`,
          success: true,
        });
      }else{
        //create actual relation
        const createdObject = await SpecialistPatient.create({
          patientId : isObjectExist.patientId,
          specialistId : isObjectExist.specialistId,
          relationCreatedBy: TRelationCreatedBy.admin
        })

        const updatedObject =  await HireSpecialistRequestToAdmin.findByIdAndUpdate(
          hireSpecialsitRequestToAdminId,
          {
            status : THireStatus.approved,
          },
          {
            new: true,
          }
        )

        // TODO 
        //------- Send notification to patient that .. Admin Approved That Specialist for you

        await enqueueWebNotification(
            `Hire Specialist request is approved by admin`,
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
      }
    }else if (status == THireStatus.pending){
      sendResponse(res, {
        code: StatusCodes.OK,
          data: null,
          message: `Status updated.`,
          success: true,
        });
    }else if (status == THireStatus.rejected){

      await HireSpecialistRequestToAdmin.findByIdAndUpdate(
        hireSpecialsitRequestToAdminId,
        {
          status: THireStatus.rejected,
        },
        { new : true}
      )

      // TODO 
      //------- Send notification to patient that .. Admin Reject That Specialist for you

      await enqueueWebNotification(
          `Hire Specialist request is rejected by admin`,
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

  // add more methods here if needed or override the existing ones 
}
