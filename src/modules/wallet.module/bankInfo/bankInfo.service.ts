//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { BankInfo } from './bankInfo.model';
import { IBankInfo } from './bankInfo.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class BankInfoService extends GenericService<
  typeof BankInfo,
  IBankInfo
> {
  constructor() {
    super(BankInfo);
  }
}
