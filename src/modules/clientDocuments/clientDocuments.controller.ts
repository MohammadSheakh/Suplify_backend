import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../_generic-module/generic.controller';
import { ClientDocuments } from './clientDocuments.model';
import { IClientDocuments } from './ClientDocuments.interface';
import { ClientDocumentsService } from './clientDocuments.service';

export class ClientDocumentsController extends GenericController<
  typeof ClientDocuments,
  IClientDocuments
> {
  ClientDocumentsService = new ClientDocumentsService();

  constructor() {
    super(new ClientDocumentsService(), 'ClientDocuments');
  }

  // add more methods here if needed or override the existing ones 
}
