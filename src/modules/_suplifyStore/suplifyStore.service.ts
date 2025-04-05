import { GenericService } from "../__Generic/generic.services";
import { SuplifyStore } from "./suplifyStore.model";

export class SuplifyStoreService extends GenericService<typeof SuplifyStore>{
    constructor(){
        super(SuplifyStore)
    }
}