import { GenericController } from "../../__Generic/generic.controller";
import { VirtualWorkoutClass } from "./virtualWorkoutClass.model";
import {  VirtualWorkoutClassService } from "./virtualWorkoutClass.service";

export class VirtualWorkoutClassController extends GenericController<typeof VirtualWorkoutClass> {
    constructor(){
        super(new VirtualWorkoutClassService(), "Virtual Workout Class")
    }
}