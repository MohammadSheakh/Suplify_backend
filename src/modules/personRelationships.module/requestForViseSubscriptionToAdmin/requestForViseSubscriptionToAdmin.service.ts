//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { RequestForViseSubscriptionToAdmin } from './requestForViseSubscriptionToAdmin.model';
import { IRequestForViseSubscriptionToAdmin } from './requestForViseSubscriptionToAdmin.interface';
import { GenericService } from '../../_generic-module/generic.services';

export class RequestForViseSubscriptionToAdminService extends GenericService<
  typeof RequestForViseSubscriptionToAdmin,
  IRequestForViseSubscriptionToAdmin
> {
  constructor() {
    super(RequestForViseSubscriptionToAdmin);
  }
}
