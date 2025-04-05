import { GenericController } from "../__Generic/generic.controller";
import {  SuplifyStore } from "./suplifyStore.model";
import {  SuplifyStoreService } from "./suplifyStore.service";

export class SuplifyStoreController extends GenericController<typeof SuplifyStore> {
    constructor(){
        super(new SuplifyStoreService(), "Suplify Store")
    }
}