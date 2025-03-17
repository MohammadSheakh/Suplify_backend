import { GenericController } from "../__Generic/generic.controller";
import { Project } from "./project.model";
import { ProjectService } from "./project.service";

export class ProjectGenericController extends GenericController<typeof Project>{
    constructor(){
        super(new ProjectService, 'Project')
    }
}