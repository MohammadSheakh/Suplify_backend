import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../__Generic/generic.controller';
import { MealService } from './meal.service';
import { Meal } from './meal.model';
import { IMeal } from './meal.interface';

// const taskService = new TaskService();
const mealService = new MealService();

export class MealController extends GenericController<typeof Meal, IMeal> {
  constructor() {
    super(
      // new LifeStyleChangesService()
      mealService,
      'Meal'
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
