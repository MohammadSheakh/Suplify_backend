import { GenericController } from "../../__Generic/generic.controller";
import { IVirtualWorkoutClass } from "./virtualWorkoutClass.interface";
import { VirtualWorkoutClass } from "./virtualWorkoutClass.model";
import {  VirtualWorkoutClassService } from "./virtualWorkoutClass.service";

export class VirtualWorkoutClassController extends GenericController<typeof VirtualWorkoutClass, IVirtualWorkoutClass> {
    constructor(){
        super(new VirtualWorkoutClassService(), "Virtual Workout Class")
    }
}