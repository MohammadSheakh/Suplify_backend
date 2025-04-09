import { GenericService } from "../../__Generic/generic.services";
import { SuplifyPartner } from "../trainingSessionAttandance/trainingSessionAttandance.model";
import { ITrainingSession } from "./trainingSession.interface";

export class TrainingSessionService extends GenericService<typeof SuplifyPartner, ITrainingSession> {
    constructor() {
        super(SuplifyPartner);
    }
}