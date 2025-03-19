import { GenericService } from "../__Generic/generic.services";
import { SuplifyPartner } from "./trainingSession.model";

export class SuplifyPartnerService extends GenericService<typeof SuplifyPartner> {
    constructor() {
        super(SuplifyPartner);
    }
}