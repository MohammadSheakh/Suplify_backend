import { GenericService } from "../__Generic/generic.services";
import { Task } from "./task.model";

export class TaskService extends GenericService<typeof Task> {
    constructor() {
        super(Task);
    }
}