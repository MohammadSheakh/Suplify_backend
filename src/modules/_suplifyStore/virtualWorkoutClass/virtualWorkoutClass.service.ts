import { GenericService } from "../../__Generic/generic.services";
import { IVirtualWorkoutClass } from "./virtualWorkoutClass.interface";
import { VirtualWorkoutClass } from "./virtualWorkoutClass.model";

export class VirtualWorkoutClassService extends GenericService<typeof VirtualWorkoutClass, IVirtualWorkoutClass>{
    constructor(){
        super(VirtualWorkoutClass)
    }
}