import { StatusCodes } from 'http-status-codes';

import { GenericService } from '../../_generic-module/generic.services';
import { PaymentTransaction } from './paymentTransaction.model';
import { IPaymentTransaction } from './paymentTransaction.interface';

// TODO : need to re check this service
export class PaymentTransactionService extends GenericService<
  typeof PaymentTransaction,
  IPaymentTransaction
> {
  constructor() {
    super(PaymentTransaction);
  }
}
