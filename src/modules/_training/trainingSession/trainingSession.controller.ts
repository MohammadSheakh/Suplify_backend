
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../__Generic/generic.controller';
import { TrainingSession } from './trainingSession.model';
import { TrainingSessionService } from './trainingSession.service';
import { ITrainingSession } from './trainingSession.interface';

// const taskService = new TaskService();
// const attachmentService = new AttachmentService();

export class TrainingSessionController extends GenericController<typeof TrainingSession, ITrainingSession> {
  constructor() {
    super(new TrainingSessionService(), 'TrainingSession');
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
