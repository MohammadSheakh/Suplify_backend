import { GenericController } from "../../__Generic/generic.controller";
import { Message } from "./message.model";
import {  MessagerService } from "./message.service";

export class MessageController extends GenericController<typeof Message> {
    constructor(){
        super(new MessagerService(), "Message")
    }
}