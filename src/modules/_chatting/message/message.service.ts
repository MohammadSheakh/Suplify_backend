import { GenericService } from "../../__Generic/generic.services";
import { Message } from "./message.model";

export class MessagerService extends GenericService<typeof Message>{
    constructor(){
        super(Message)
    }
}