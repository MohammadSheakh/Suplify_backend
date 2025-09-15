//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { Protocol } from './protocol.model';
import { IProtocol } from './protocol.interface';
import { GenericService } from '../../_generic-module/generic.services';

export class ProtocolService extends GenericService<
  typeof Protocol,
  IProtocol
> {
  constructor() {
    super(Protocol);
  }
}
