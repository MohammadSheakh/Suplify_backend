import { StatusCodes } from 'http-status-codes';
import { Wallet } from './Wallet.model';
import { IWallet } from './Wallet.interface';
import { GenericService } from '../_generic-module/generic.services';


export class WalletService extends GenericService<
  typeof Wallet,
  IWallet
> {
  constructor() {
    super(Wallet);
  }
}
