import { GenericService } from "../../../__Generic/generic.services";
import { IUserMealPlan } from "./userMealPlan.interface";
import { UserMealPlan } from "./userMealPlan.model";


export class UserLifeStyleChangesService extends GenericService<
  typeof UserMealPlan,
  IUserMealPlan
> {
  constructor() {
    super(UserMealPlan);
  }
}
