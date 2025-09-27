//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { Wallet } from './wallet.model';
import { IWallet } from './wallet.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class WalletService extends GenericService<
  typeof Wallet,
  IWallet
> {
  constructor() {
    super(Wallet);
  }
}
