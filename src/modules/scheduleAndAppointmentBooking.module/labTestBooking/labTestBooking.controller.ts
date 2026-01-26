//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { LabTestBooking } from './labTestBooking.model';
import { LabTestBookingService } from './labTestBooking.service';
import { IBookLabTest, ILabTestBooking } from './labTestBooking.interface';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import ApiError from '../../../errors/ApiError';

// let conversationParticipantsService = new ConversationParticipentsService();

let labTestBookingService = new LabTestBookingService();

export class LabTestBookingController extends GenericController<
  typeof LabTestBooking,
  ILabTestBooking
> {
  LabTestBookingService = new LabTestBookingService();

  constructor() {
    super(new LabTestBookingService(), 'LabTestBooking');
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const userTimeZone = req.header('X-Time-Zone') || 'Asia/Dhaka'; //TODO: Timezone must from env file

    const data = req.body as Partial<IBookLabTest>;
    const result = await labTestBookingService.createV2(data, req.user, userTimeZone);

    sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: `${this.modelName} created successfully`,
    success: true,
    });
  });

  //🆕
  updateWithImageById = catchAsync(async (req: Request, res: Response) => {

    if (!req.params.id) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `id is required for update ${this.modelName}`
      );
    }
    
    const id = req.params.id;

    const existingObject = await this.service.getById(id);

    // console.log("req.uploadedFiles?.uploadedResults?.[0] -> ", req.uploadedFiles?.uploadedResults?.[0]);

    // new uploaded attachment (if any)
    const newAttachment = req.uploadedFiles?.uploadedResults?.[0];

    // console.log("newAttachment -> ", newAttachment);

    // final attachment (new OR existing)
    const finalAttachment =
      newAttachment ?? existingObject.uploadedResults;

    // console.log("finalAttachment -> ", finalAttachment);

    // derive flag
    const isResultUploaded = Boolean(finalAttachment); 

  
    // TODO : proper type needs to be pass here... 
    const existingObjectDTO : ILabTestBooking = {
      uploadedResults : req.uploadedFiles.uploadedResults?.[0] ?? existingObject?.uploadedResults,
      isResultUploaded,
      ...req.body
    }

    const updatedObject = await this.service.updateById(id, /*req.body*/ existingObjectDTO);
    if (!updatedObject) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Object with ID ${id} not found`
      );
    }
    
    //   return res.status(StatusCodes.OK).json(updatedObject);
    sendResponse(res, {
      code: StatusCodes.OK,
      data: updatedObject,
      message: `${this.modelName} updated successfully`,
    });
  });

  // add more methods here if needed or override the existing ones 
}
