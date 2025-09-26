import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../_generic-module/generic.controller';
import { Wallet } from './Wallet.model';
import { IWallet } from './Wallet.interface';
import { WalletService } from './Wallet.service';

export class WalletController extends GenericController<
  typeof Wallet,
  IWallet
> {
  WalletService = new WalletService();

  constructor() {
    super(new WalletService(), 'Wallet');
  }

  // add more methods here if needed or override the existing ones 
}
