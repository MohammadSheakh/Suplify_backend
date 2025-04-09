import { GenericService } from "../__Generic/generic.services";
import { ISuplifyStore } from "./suplifyStore.interface";
import { SuplifyStore } from "./suplifyStore.model";

export class SuplifyStoreService extends GenericService<typeof SuplifyStore, ISuplifyStore>{
    constructor(){
        super(SuplifyStore)
    }
}