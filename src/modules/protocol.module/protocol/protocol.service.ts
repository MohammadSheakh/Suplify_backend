import { StatusCodes } from 'http-status-codes';
import { protocol } from './protocol.model';
import { Iprotocol } from './protocol.interface';
import { GenericService } from '../../__Generic/generic.services';


export class protocolService extends GenericService<
  typeof protocol,
  Iprotocol
> {
  constructor() {
    super(protocol);
  }
}
