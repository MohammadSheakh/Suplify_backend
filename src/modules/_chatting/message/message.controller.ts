import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { GenericController } from "../../__Generic/generic.controller";
import { Message } from "./message.model";
import {  MessagerService } from "./message.service";
import { Request, Response } from 'express';
import { AttachmentService } from "../../attachments/attachment.service";
import { FolderName } from "../../../enums/folderNames";
import { AttachedToType } from "../../attachments/attachment.constant";
import { IMessage } from "./message.interface";

const attachmentService = new AttachmentService();

export class MessageController extends GenericController<typeof Message, IMessage> {
    messageService = new MessagerService();
    constructor(){
        super(new MessagerService(), "Message")
    }

    create = catchAsync(async (req: Request, res: Response) => {
        
        const {conversationId} = req.query;

        if (req.user.userId) {
            req.body.senderId = req.user.userId;
            req.body.senderRole =  req.user.role === 'user' ? 'member' : 'admin'; 
            req.body.conversationId = conversationId;
        }

        let attachments = [];
  
        if (req.files && req.files.attachments) {
        attachments.push(
            ...(await Promise.all(
            req.files.attachments.map(async file => {
                const attachmenId = await attachmentService.uploadSingleAttachment(
                    file,
                    "folderNameSuplify",
                    req.body.projectId,
                    req.user,
                    AttachedToType.message
                );
                return attachmenId;
            })
            ))
        );
        }

        req.body.attachments = attachments;

        const result = await this.service.create({
            text: req.body.text,
            senderId: req.body.senderId,
            senderRole: req.body.senderRole,
            conversationId: req.body.conversationId,
            attachments: req.body.attachments,
        });

        // 🔥 message create houar pore conversation er last 
        // message update korte hobe .. 
    
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