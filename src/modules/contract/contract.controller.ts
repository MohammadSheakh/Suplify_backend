
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../shared/pick';
import { ContractService } from './contract.service';
import ApiError from '../../errors/ApiError';
import { AttachmentService } from '../attachments/attachment.service';
import { FolderName } from '../../enums/folderNames';
import { AttachedToType } from '../attachments/attachment.constant';


const contractService = new ContractService();
const attachmentService = new AttachmentService();


//[🚧][🧑‍💻✅][🧪🆗]
const createContract = catchAsync(async (req, res) => {
  if (req.user.role !== 'projectManager') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Only Project Manager can access this.'
    );
  }

  if (req.user.userId) {
    req.body.createdBy = req.user.userId;
    req.body.creatorRole = 'projectManager';
  }

    let attachments = [];
    
      if (req.files && req.files.attachments) {
        attachments.push(
          ...(await Promise.all(
            req.files.attachments.map(async file => {
              const attachmenId = await attachmentService.uploadSingleAttachment(
                file,
                FolderName.aimConstruction,
                req.body.projectId,
                req.user,
                AttachedToType.contract // TODO : eta add korte hobe .. but make sure korte hobe .. ei document jeno manager chara ar keo dekhte na pare 
              ); // FIXME  : make sure korte hobe .. ei document jeno manager chara ar keo dekhte na pare  
              return attachmenId;
            })
          ))
        );
      }
  
      req.body.attachments = attachments;

  const result = await contractService.create(req.body);


  if (attachments.length > 0) {
    await Promise.all(
      attachments.map(async attachmentId => {
        // Assuming you have a service or model method to update the attachment's attachedToId and attachedToType
        await attachmentService.updateById(
          attachmentId, // Pass the attachment ID
          {
            attachedToId: result._id,
          }
        );
      })
    );
  }
  
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Contract created successfully',
    success: true,
  });
});

const getAContract = catchAsync(async (req, res) => {
  const result = await contractService.getById(req.params.contractId);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Contract retrieved successfully',
    success: true,
  });
});

const getAllContract = catchAsync(async (req, res) => {
  const result = await contractService.getAll();
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'All Contracts',
    success: true,
  });
});

const getAllContractWithPagination = catchAsync(async (req, res) => {
  const filters = pick(req.query, [ '_id']); // 'projectName',
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

  const result = await contractService.getAllWithPagination(filters, options);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'All Contracts with Pagination',
    success: true,
  });
});

const updateById = catchAsync(async (req, res) => {
  const result = await contractService.updateById(
    req.params.contractId,
    req.body
  );
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Contract updated successfully',
    success: true,
  });
});

const deleteById = catchAsync(async (req, res) => {
  await contractService.deleteById(req.params.contractId);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Contract deleted successfully',
    success: true,
  });
});

export const ContractController = {
  createContract,
  getAllContract,
  getAllContractWithPagination,
  getAContract,
  updateById,
  deleteById,
};
