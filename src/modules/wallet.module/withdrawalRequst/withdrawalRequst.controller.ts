//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { WithdrawalRequst } from './withdrawalRequst.model';
import { IWithdrawalRequst } from './WithdrawalRequst.interface';
import { WithdrawalRequstService } from './withdrawalRequst.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUser } from '../../token/token.interface';
import { BankInfo } from '../bankInfo/bankInfo.model';
import { Wallet } from '../wallet/wallet.model';
import { IWallet } from '../wallet/wallet.interface';
import { TWithdrawalRequst } from './withdrawalRequst.constant';
import { processFiles } from '../../../helpers/processFilesToUpload';
import { TFolderName } from '../../../enums/folderNames';

export class WithdrawalRequstController extends GenericController<
  typeof WithdrawalRequst,
  IWithdrawalRequst
> {
  WithdrawalRequstService = new WithdrawalRequstService();

  constructor() {
    super(new WithdrawalRequstService(), 'WithdrawalRequst');
  }

  /***********
   * 
   * Specialist / Doctor  | Wallet | Create withdrawal request
   * TODO : MUST : NEED_TO_TEST
   * ******** */
  create = catchAsync(async (req: Request, res: Response) => {
    
    const data:IWithdrawalRequst = req.body;

    data.userId = (req.user as IUser).userId;

    /********
     * 📝
     * first we check withdrawl amount is less than wallet amount
     * TODO : MUST : mongodb transaction add korte hobe 
     *  
     * check user have current bank information or not 
     * 
     * for requested user.. we need to check last withdrawal request is in week or not
     * if in week then we can not create withdrawal request
     * 
     * ****** */

    const bankInfo = await BankInfo.findOne({
      userId: data.userId,
      isActive : true
    })

    if (!bankInfo) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: 'No Bank Info Found',
        success: false,
      });
    }

    // lets get the wallet
    const wallet:IWallet = await Wallet.findOne({
      userId: data.userId,
      _id: data.walletId
    });

    if (!wallet) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: 'No wallet Found',
        success: false,
      });
    }


    if(data.requestedAmount > wallet.amount){
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: 'Insufficient wallet amount',
        success: false,
      });
    }

    const docToCreate : IWithdrawalRequst = {
      walletId : data.walletId,
      userId : data.userId,
      requestedAmount : data.requestedAmount,
      bankAccountNumber : bankInfo.bankAccountNumber,
      bankRoutingNumber : bankInfo.bankRoutingNumber,
      bankAccountHolderName : bankInfo.bankAccountHolderName,
      bankAccountType : bankInfo.bankAccountType,
      bankBranch : bankInfo.bankBranch,
      bankName : bankInfo.bankName,
      status : TWithdrawalRequst.requested,
      requestedAt: new Date(),
      processedAt : null,
    }

    const lastWithdrawalRequest = await WithdrawalRequst.findOne({
      userId: data.userId
    }).sort({
      createdAt: -1
    }) // TODO : MUST : add logic 


    const result = await this.service.create(docToCreate);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  /************
   * 
   *  Admin | Upload receipt And Update status 
   * 
   * ********** */
  uploadReceiptAndUpdateStatus = catchAsync(async (req: Request, res: Response) => {
    /*******
     * 📝
     * deduct the amount of wallet and update status to completed
     * without "proofOfPayment" document dont let user to update status 
     * update the "processedAt" date
     * 
     * ***** */

    //📈⚙️ OPTIMIZATION: Process both file types in parallel
    const [proofOfPayment] = await Promise.all([
      processFiles(req.files?.proofOfPayment, TFolderName.wallet)
    ]);

    const withdrawalRequstId = req.params.id;

    const withdrawalRequst : IWithdrawalRequst = await WithdrawalRequst.findById(withdrawalRequstId);

    if (!withdrawalRequst) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: 'No withdrawalRequst Found',
        success: false,
      });
    }

    withdrawalRequst.proofOfPayment = proofOfPayment[0];
    withdrawalRequst.status = TWithdrawalRequst.completed;
    withdrawalRequst.processedAt = new Date();

    const updated =  await withdrawalRequst.save();

    sendResponse(res, {
      code: StatusCodes.OK,
      data: updated,
      message: `${this.modelName} updated successfully`,
      success: true,
    });
  })


  // add more methods here if needed or override the existing ones 
}
