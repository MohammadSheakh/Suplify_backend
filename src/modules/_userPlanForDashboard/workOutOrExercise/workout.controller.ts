import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../__Generic/generic.controller';
import { WorkoutService } from './workout.service';
import { Workout } from './workout.model';
import { IWorkout } from './workout.interface';

// const taskService = new TaskService();
const workoutService = new WorkoutService();

export class WorkoutController extends GenericController<typeof Workout, IWorkout> {
  constructor() {
    super(
      // new LifeStyleChangesService()
      workoutService,
      'Workout'
    );
  }
  // private taskService = new TaskService();

  // getById = catchAsync(async (req, res) => {
  //   const result = await this.taskService.getById(req.params.taskId);
  //   console.log("hit 😊😊")
  //   sendResponse(res, {
  //     code: StatusCodes.OK,
  //     data: result,
  //     message: 'Task retrieved successfully Chomolokko',
  //   });
  // });
}
