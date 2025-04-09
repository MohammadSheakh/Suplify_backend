import { StatusCodes } from 'http-status-codes';
import {  TrainingProgramService,  } from './trainingProgram.service';
import { GenericController } from '../../__Generic/generic.controller';
import { TrainingProgram } from './trainingProgram.model';
import { ITRrainingProgram } from './trainingProgram.interface';


// const taskService = new TaskService();
// const attachmentService = new AttachmentService();

export class TrainingProgramController extends GenericController<typeof TrainingProgram, ITRrainingProgram> {
  constructor() {
    super(new TrainingProgramService(), 'Training Program');
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
