import { GenericService } from "../../__Generic/generic.services";
import { ConversationParticipents } from "./conversationParticipents.model";

export class ConversationParticipentsService extends GenericService<typeof ConversationParticipents>{
    constructor(){
        super(ConversationParticipents)
    }
}