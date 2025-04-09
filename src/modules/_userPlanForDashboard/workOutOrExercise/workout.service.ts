import { GenericService } from '../../__Generic/generic.services';
import { IWorkout } from './workout.interface';
import { Workout } from './workout.model';

export class WorkoutService extends GenericService<typeof Workout, IWorkout> {
  constructor() {
    super(Workout);
  }
}
