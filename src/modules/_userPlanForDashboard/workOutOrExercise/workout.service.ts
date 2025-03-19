import { GenericService } from '../../__Generic/generic.services';
import { Workout } from './workout.model';

export class WorkoutService extends GenericService<typeof Workout> {
  constructor() {
    super(Workout);
  }
}
