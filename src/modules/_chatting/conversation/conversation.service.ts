import { Model } from "mongoose";
import { GenericService } from "../../__Generic/generic.services";
import { IConversation } from "./conversation.interface";
import { Conversation } from "./conversation.model";

export class ConversationService extends GenericService<typeof Conversation , IConversation>{
    constructor(){
        super(Conversation)
    }

    // async create(data) {
    //     // console.log('req.body from generic create 🧪🧪', data);
    //     return await this.model.create(data);
    //   }
}