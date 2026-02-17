//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { NotificationService } from './notification.services';
import catchAsync from '../../shared/catchAsync';
import pick from '../../shared/pick';
import sendResponse from '../../shared/sendResponse';
import { notificationFilters, TNotificationType } from './notification.constants';
import { enqueueWebNotification } from '../../services/notification.service';
import { TRole } from '../../middlewares/roles';


const sendTestNotification = catchAsync(async (req, res) => {
  const { isToAdmin, patientId } = req.query;

  console.log("isToAdmin ... patientId ...", typeof isToAdmin, " --- ", patientId);

  if(isToAdmin === "true"){
    // send notification to admin

    /*──────────────────────────────────
    |   send test notification to admin 
    └────────────────────────────────────*/
    await enqueueWebNotification(
      `Test Notification to admin  ${Date.now().toLocaleString()}`,
      patientId, // senderId
      null, // receiverId 
      TRole.admin, // receiverRole
      TNotificationType.system, // type
      /**********
       * In UI there is no details page for specialist's schedule
       * **** */
      // '', // linkFor
      // existingWorkoutClass._id // linkId
      // TTransactionFor.TrainingProgramPurchase, // referenceFor
      // purchaseTrainingProgram._id // referenceId
    );

  }else{
    /*──────────────────────────────────
    |   send test notification to patient 
    └────────────────────────────────────*/
    await enqueueWebNotification(
      `Test Notification to patient ${Date.now().toLocaleString()}`,
      null, // senderId
      patientId, // receiverId 
      TRole.patient, // receiverRole
      TNotificationType.system, // type
      /**********
       * In UI there is no details page for specialist's schedule
       * **** */
      // '', // linkFor
      // existingWorkoutClass._id // linkId
      // TTransactionFor.TrainingProgramPurchase, // referenceFor
      // purchaseTrainingProgram._id // referenceId
    );
  }

  sendResponse(res, {
    code: StatusCodes.OK,
    data: null,
    message: 'Notifications sent successfully',
    success: true,
  });

})

const getALLNotification = catchAsync(async (req, res) => {
  const filters = pick(req.query, notificationFilters);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  options.sortBy = '-createdAt'; // latest notification first
  const userId = req.user.userId;
  const result = await NotificationService.getALLNotification(
    filters,
    options,
    userId
  );
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Notifications fetched successfully',
    success: true,
  });
});

const getAdminNotifications = catchAsync(async (req, res) => {
  const filters = pick(req.query, notificationFilters);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  options.sortBy = '-createdAt'; // latest notification first
  const result = await NotificationService.getAdminNotifications(
    filters,
    options
  );
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Admin Notifications fetched successfully',
  });
});

const getSingleNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NotificationService.getSingleNotification(id);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Notification fetched successfully',
    success: true,
  });
});

const viewNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NotificationService.viewNotification(id);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Notification viewed successfully',
    success: true,
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NotificationService.deleteNotification(id);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Notification deleted successfully',
    success: true,
    data: {},
  });
});

const clearAllNotification = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  await NotificationService.clearAllNotification(userId);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'All notifications cleared successfully',
    success: true,
    data: {},
  });
});

export const NotificationController = {
  sendTestNotification,
  getALLNotification,
  getAdminNotifications,
  getSingleNotification,
  viewNotification,
  deleteNotification,
  clearAllNotification,
};
