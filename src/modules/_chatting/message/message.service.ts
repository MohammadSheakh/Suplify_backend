import { GenericService } from "../../__Generic/generic.services";
import { IMessage } from "./message.interface";
import { Message } from "./message.model";

export class MessagerService extends GenericService<typeof Message>{ /**typeof Message */
    constructor(){
        super(Message)
    }
}