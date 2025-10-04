//@ts-ignore
import { Request, Response } from 'express';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { GenericController } from '../../_generic-module/generic.controller';
import { BankInfo } from './bankInfo.model';
import { IBankInfo } from './bankInfo.interface';
import { BankInfoService } from './bankInfo.service';

export class BankInfoController extends GenericController<
  typeof BankInfo,
  IBankInfo
> {
  bankInfoService = new BankInfoService();

  constructor() {
    super(new BankInfoService(), 'BankInfo');
  }

  // add more methods here if needed or override the existing ones 
}
