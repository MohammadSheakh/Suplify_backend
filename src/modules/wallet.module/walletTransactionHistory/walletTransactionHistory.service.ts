import { StatusCodes } from 'http-status-codes';
import { WalletTransactionHistory } from './WalletTransactionHistory.model';
import { IWalletTransactionHistory } from './WalletTransactionHistory.interface';
import { GenericService } from '../_generic-module/generic.services';


export class WalletTransactionHistoryService extends GenericService<
  typeof WalletTransactionHistory,
  IWalletTransactionHistory
> {
  constructor() {
    super(WalletTransactionHistory);
  }
}
