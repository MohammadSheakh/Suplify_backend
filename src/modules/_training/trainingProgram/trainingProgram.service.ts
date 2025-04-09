import { GenericService } from "../../__Generic/generic.services";
import { ITRrainingProgram } from "./trainingProgram.interface";
import { TrainingProgram } from "./trainingProgram.model";

export class TrainingProgramService extends GenericService<typeof TrainingProgram, ITRrainingProgram> {
    constructor() {
        super(TrainingProgram);
    }
}