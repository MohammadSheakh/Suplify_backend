import { GenericService } from "../../__Generic/generic.services";
import { TrainingProgram } from "./trainingProgram.model";

export class TrainingProgramService extends GenericService<typeof TrainingProgram> {
    constructor() {
        super(TrainingProgram);
    }
}