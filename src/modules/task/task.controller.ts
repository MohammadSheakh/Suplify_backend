import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../shared/pick';
import { Task } from './task.model';
import { TaskService } from './task.service';
import { TaskStatus } from './task.constant';
import { AttachmentService } from '../attachments/attachment.service';
import { FolderName } from '../../enums/folderNames';
import { AttachedToType } from '../attachments/attachment.constant';
import { NotificationService } from '../notification/notification.services';

const taskService = new TaskService();
const attachmentService = new AttachmentService();

const getATask = catchAsync(async (req, res) => {
  const result = await taskService.getById(req.params.taskId);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Task retrieved successfully',
  });
});

const getAllTask = catchAsync(async (req, res) => {
  const result = await taskService.getAll();
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'All Tasks',
  });
});

const getAllTaskWithPagination = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['_id']); // 'projectName',
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

  const result = await taskService.getAllWithPagination(filters, options);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'All tasks with Pagination',
  });
});

const updateById = catchAsync(async (req, res) => {
  const result = await taskService.updateById(req.params.taskId, req.body);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Task updated successfully',
  });
});

//[🚧][🧑‍💻✅][🧪🆗] // working perfectly
const deleteById = catchAsync(async (req, res) => {
  const task = await taskService.getById(req.params.taskId);

  console.log('task 🧪🧪🧪🧪', task);
  if (task) {
    if (task.attachments && task.attachments.length > 0) {
      await Promise.all(
        task.attachments.map(async attachmentId => {
          // ei attachment id ta exist kore kina sheta age check korte hobe
          let attachment = await attachmentService.getById(attachmentId);
          if (attachment) {
            const attachmentDeleteRes = await attachmentService.deleteById(
              attachmentId
            );
          } else {
            console.log('attachment not found ...');
          }
        })
      );
    }
  }
  await taskService.deleteById(req.params.taskId);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Task deleted successfully',
  });
});

export const TaskController = {
  getAllTask,
  getAllTaskWithPagination,
  getATask,
  updateById,
  deleteById,
};
