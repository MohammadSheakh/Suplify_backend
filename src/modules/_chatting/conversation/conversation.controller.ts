import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { GenericController } from "../../__Generic/generic.controller";
import { Conversation } from "./conversation.model";
import { ConversationService } from "./conversation.service";
import { StatusCodes } from "http-status-codes";
import { ConversationParticipentsService } from "../conversationParticipents/conversationParticipents.service";
import ApiError from "../../../errors/ApiError";
import { IConversation, IConversationModel } from "./conversation.interface";
import { ConversationType } from "./conversation.constant";
import { IConversationParticipents } from "../conversationParticipents/conversationParticipents.interface";
import { MessagerService } from "../message/message.service";
import { IMessage } from "../message/message.interface";



let conversationParticipantsService = new ConversationParticipentsService();
let messageService = new MessagerService();
                

export class ConversationController extends GenericController<IConversation> {
 conversationService = new ConversationService();

    constructor(){
        super(new ConversationService(), "Conversation")
    }

    // override
    create = catchAsync(async (req: Request, res: Response) => {
        let type;
        // creatorId ta req.user theke ashbe  
        //req.body.creatorId = req.user.userId;
        let { participants, message, attachedToId, attachedToCategory } = req.body; // type,

        // type is based on participants count .. if count is greater than 2 then group else direct

        if(!participants){
            // 🔥 test korte hobe logic .. 
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Without participants you can not create a conversation');
        }

        participants = [...participants, req.user.userId]; // add yourself to the participants list

        let result : IConversation;
        if(participants.length > 0){
            type = participants.length > 2 ? ConversationType.group : ConversationType.direct;

            const conversationData :IConversation = {
                creatorId : req.user.userId,
                type,
                // attachedToId,
                // attachedToCategory,
            };

            result = await this.service.create(conversationData);

            /*
            participants.forEach(async(participant: string) => {
                // i think participant is just a ID
                
                console.log("🔥🔥participants🔥" , participants)

                
                const res1 =  await conversationParticipantsService.create({
                    // 🔴 incomplete
                    userId: participant,
                    conversationId: result?._id,
                } );

                console.log("🔥🔥res1🔥" , res1)

            });
            */

            for (const participant of participants) {
                // try {
                    console.log("🔥🔥participants🔥", participants);
            
                    const res1 = await conversationParticipantsService.create({
                        userId: participant,
                        conversationId: result?._id,
                        role: req.user.role === 'user' ? 'member' : 'admin',
                    });
                    if (!res1) {
                        throw new ApiError(StatusCodes.BAD_REQUEST, 'Unable to create conversation participant');
                    }
            
                    console.log("🔥🔥res1🔥", res1);
                // } catch (error) {
                    // console.error("Error creating conversation participant:", error);
                // }
            }

            if(message){
                const res1:IMessage = await messageService.create({
                    text : message,
                    senderId : req.user.userId,
                    conversationId : result._id,
                    senderRole : req.user.role === 'user' ? 'member' : 'admin',
                    
                });
                if (!res1) {
                    throw new ApiError(StatusCodes.BAD_REQUEST, 'Unable to create conversation participant');
                }
            }

            sendResponse(res, {
                code: StatusCodes.OK,
                data: result,
                message: `${this.modelName} created successfully`,
                success: true,
              });
        }
      });

    addParticipantsToExistingConversation = catchAsync(async (req: Request, res: Response) => {
        const { participantId, conversationId } = req.body;

        if(participantId === req.user.userId){
            throw new ApiError(StatusCodes.BAD_REQUEST, 'You can not add yourself');
        }

        const conversation = await this.service.getById(conversationId);
        if (!conversation) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
        }
        // for single Participant insert 

        const res1 = await conversationParticipantsService.create({
            userId: participantId,
            conversationId: conversation?._id,
            role: req.user.role === 'user' ? 'member' : 'admin',
        });

        if (!res1) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Unable to add participant');
        }

        // 🔥🔥 Multiple er jonno o handle korte hobe .. single er jonno o handle korte hobe .. 
            sendResponse(res, {
                code: StatusCodes.OK,
                data: res1,
                message: `Participents added successfully to this ${this.modelName}.. ${conversationId}`,
                success: true,
              });


    })
}