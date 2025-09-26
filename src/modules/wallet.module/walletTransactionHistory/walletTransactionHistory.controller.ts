import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../_generic-module/generic.controller';
import { WalletTransactionHistory } from './WalletTransactionHistory.model';
import { IWalletTransactionHistory } from './WalletTransactionHistory.interface';
import { WalletTransactionHistoryService } from './WalletTransactionHistory.service';

export class WalletTransactionHistoryController extends GenericController<
  typeof WalletTransactionHistory,
  IWalletTransactionHistory
> {
  WalletTransactionHistoryService = new WalletTransactionHistoryService();

  constructor() {
    super(new WalletTransactionHistoryService(), 'WalletTransactionHistory');
  }

  // add more methods here if needed or override the existing ones 
}
