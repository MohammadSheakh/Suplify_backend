import { GenericService } from "../__Generic/generic.services";
import { Company } from "./company.model";

export class AttachmentService extends GenericService<typeof Company> {
    constructor() {
        super(Company);
    }
}