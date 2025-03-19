import { GenericService } from '../../__Generic/generic.services';
import { Meal } from './meal.model';

export class MealService extends GenericService<typeof Meal> {
  constructor() {
    super(Meal);
  }
}
