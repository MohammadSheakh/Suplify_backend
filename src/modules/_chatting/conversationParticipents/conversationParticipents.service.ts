import { GenericService } from "../../__Generic/generic.services";
import { ConversationParticipents } from "./conversationParticipents.model";

export class ConversationParticipentsService extends GenericService<typeof ConversationParticipents>{
    constructor(){
        super(ConversationParticipents)
    }

    async getByUserIdAndConversationId(userId: string) {
        const object = await this.model.find({userId});
        console.log("hit 👌")
        if (!object) {
          // throw new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded');
          return null;
        }
        return object;
      }
}