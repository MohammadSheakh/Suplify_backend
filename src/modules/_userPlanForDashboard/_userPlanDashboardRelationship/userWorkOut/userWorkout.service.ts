import { GenericService } from "../../../__Generic/generic.services";
import { IUserWorkout } from "./userWorkout.interface";
import { UserWorkout } from "./userWorkout.model";


export class UserWorkOutService extends GenericService<
  typeof UserWorkout,
  IUserWorkout
> {
  constructor() {
    super(UserWorkout);
  }
}
