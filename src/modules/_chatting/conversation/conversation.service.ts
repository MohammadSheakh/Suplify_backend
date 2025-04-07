import { GenericService } from "../../__Generic/generic.services";
import { Conversation } from "./conversation.model";

export class ConversationService extends GenericService<typeof Conversation>{
    constructor(){
        super(Conversation)
    }

    // async create(data) {
    //     // console.log('req.body from generic create 🧪🧪', data);
    //     return await this.model.create(data);
    //   }
}