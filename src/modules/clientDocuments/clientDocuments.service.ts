import { StatusCodes } from 'http-status-codes';
import { ClientDocuments } from './clientDocuments.model';
import { IClientDocuments } from './clientDocuments.interface';
import { GenericService } from '../_generic-module/generic.services';


export class ClientDocumentsService extends GenericService<
  typeof ClientDocuments,
  IClientDocuments
> {
  constructor() {
    super(ClientDocuments);
  }
}
