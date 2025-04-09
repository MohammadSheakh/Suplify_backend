import { GenericController } from "../__Generic/generic.controller";
import { ISuplifyStore } from "./suplifyStore.interface";
import {  SuplifyStore } from "./suplifyStore.model";
import {  SuplifyStoreService } from "./suplifyStore.service";

export class SuplifyStoreController extends GenericController<typeof SuplifyStore, ISuplifyStore> {
    constructor(){
        super(new SuplifyStoreService(), "Suplify Store")
    }
}