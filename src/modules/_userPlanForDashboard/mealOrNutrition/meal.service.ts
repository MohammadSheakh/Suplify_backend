import { GenericService } from '../../__Generic/generic.services';
import { IMeal } from './meal.interface';
import { Meal } from './meal.model';

export class MealService extends GenericService<typeof Meal, IMeal> {
  constructor() {
    super(Meal);
  }
}
