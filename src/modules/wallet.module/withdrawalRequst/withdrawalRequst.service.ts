import { StatusCodes } from 'http-status-codes';
import { WithdrawalRequst } from './WithdrawalRequst.model';
import { IWithdrawalRequst } from './WithdrawalRequst.interface';
import { GenericService } from '../_generic-module/generic.services';


export class WithdrawalRequstService extends GenericService<
  typeof WithdrawalRequst,
  IWithdrawalRequst
> {
  constructor() {
    super(WithdrawalRequst);
  }
}
