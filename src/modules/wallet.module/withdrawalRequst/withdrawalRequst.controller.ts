import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../_generic-module/generic.controller';
import { WithdrawalRequst } from './WithdrawalRequst.model';
import { IWithdrawalRequst } from './WithdrawalRequst.interface';
import { WithdrawalRequstService } from './WithdrawalRequst.service';

export class WithdrawalRequstController extends GenericController<
  typeof WithdrawalRequst,
  IWithdrawalRequst
> {
  WithdrawalRequstService = new WithdrawalRequstService();

  constructor() {
    super(new WithdrawalRequstService(), 'WithdrawalRequst');
  }

  // add more methods here if needed or override the existing ones 
}
