import { GenericService } from "../../__Generic/generic.services";
import { VirtualWorkoutClass } from "./conversationParticipents.model";

export class VirtualWorkoutClassService extends GenericService<typeof VirtualWorkoutClass>{
    constructor(){
        super(VirtualWorkoutClass)
    }
}