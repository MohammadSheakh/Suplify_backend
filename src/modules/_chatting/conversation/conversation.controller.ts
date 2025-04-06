import { GenericController } from "../../__Generic/generic.controller";
import { Conversation } from "./conversation.model";
import { ConversationService } from "./conversation.service";

export class ConversationController extends GenericController<typeof Conversation> {
    constructor(){
        super(new ConversationService(), "Conversation")
    }
}