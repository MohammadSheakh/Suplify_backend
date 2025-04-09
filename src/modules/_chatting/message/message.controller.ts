import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { GenericController } from "../../__Generic/generic.controller";
import { Message } from "./message.model";
import {  MessagerService } from "./message.service";
import { Request, Response } from 'express';

export class MessageController extends GenericController<typeof Message> {
    messageService = new MessagerService();
    constructor(){
        super(new MessagerService(), "Message")
    }

    create = catchAsync(async (req: Request, res: Response) => {
        const data = req.body;
        // const result = await this.service.create(data);

        const {conversationId} = req.query;

        if (req.user.userId) {
            req.body.senderId = req.user.userId;
            req.body.senderRole = req.user.role; 
            req.body.conversationId = conversationId;
        }

        let attachments = [];
  
        if (req.files && req.files.attachments) {
        attachments.push(
            ...(await Promise.all(
            req.files.attachments.map(async file => {
                const attachmenId = await AttachmentService.uploadSingleAttachment(
                    file,
                    FolderName.task,
                    req.body.projectId,
                    req.user,
                    AttachedToType.task
                );
                return attachmenId;
            })
            ))
        );
        }

        req.body.attachments = attachments;
    
        sendResponse(res, {
          code: StatusCodes.OK,
          data: result,
          message: `${this.modelName} created successfully`,
          success: true,
        });
      });
   

    getAllMessageByConversationId = catchAsync(
        async (req: Request, res: Response) => {
            const { conversationId } = req.query;

            if (!conversationId) {
                return sendResponse(res, {
                    code: StatusCodes.BAD_REQUEST,
                    message: "Conversation ID is required",
                    success: false,
                });
            }

            const result = await this.messageService.getAllByConversationId(
                conversationId.toString()
            );

            sendResponse(res, {
                code: StatusCodes.OK,
                data: result,
                message: `${this.modelName} fetched successfully`,
                success: true,
            });
        })
}