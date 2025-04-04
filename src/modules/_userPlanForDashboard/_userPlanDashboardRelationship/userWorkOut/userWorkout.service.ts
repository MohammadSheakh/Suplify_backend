import { GenericService } from "../../../__Generic/generic.services";
import { UserWorkout } from "./userWorkout.model";


export class UserWorkOutService extends GenericService<
  typeof UserWorkout
> {
  constructor() {
    super(UserWorkout);
  }
}
