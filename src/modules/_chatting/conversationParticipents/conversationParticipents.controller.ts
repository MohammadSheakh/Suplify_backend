import { GenericController } from "../../__Generic/generic.controller";
import { ConversationParticipents } from "./conversationParticipents.model";

import {  ConversationParticipentsService } from "./conversationParticipents.service";

export class ConversationParticipentsController extends GenericController<typeof ConversationParticipents> {
    constructor(){
        super(new ConversationParticipentsService(), "Conversation Participents")
    }
}