import { GenericService } from "../../../__Generic/generic.services";
import { UserMealPlan } from "./userMealPlan.model";


export class UserLifeStyleChangesService extends GenericService<
  typeof UserMealPlan
> {
  constructor() {
    super(UserMealPlan);
  }
}
