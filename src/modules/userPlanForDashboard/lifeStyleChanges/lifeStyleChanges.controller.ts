import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../__Generic/generic.controller';
import { LifeStyleChangesService } from './lifeStyleChanges.service';
import { LifeStyleChanges } from './lifeStyleChanges.model';

// const taskService = new TaskService();
const lifeStyleChangesService = new LifeStyleChangesService();

export class LifeStyleChangesController extends GenericController<
  typeof LifeStyleChanges
> {
  constructor() {
    super(
      // new LifeStyleChangesService()
      lifeStyleChangesService,
      'LifeStyle'
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
