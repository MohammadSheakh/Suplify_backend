import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../__Generic/generic.controller';
import { GroceryList } from './groceryList.model';
import { GroceryListService } from './groceryList.service';


// const taskService = new TaskService();
const groceryListService = new GroceryListService();

export class GroceryListController extends GenericController<
  typeof GroceryList
> {
  constructor() {
    super(
      groceryListService,
      'GroceryList'
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
