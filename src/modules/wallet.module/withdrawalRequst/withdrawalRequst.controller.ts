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
   * 
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
      userId: data.userId
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

    const result = await this.service.create(data);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} created successfully`,
      success: true,
    });
  });

  // add more methods here if needed or override the existing ones 
}
