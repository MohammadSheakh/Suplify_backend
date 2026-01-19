//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { SuplifyHotspot } from './suplifyHotspot.model';
import { ISuplifyHotspot } from './suplifyHotspot.interface';
import { GenericService } from '../_generic-module/generic.services';


export class SuplifyHotspotService extends GenericService<
  typeof SuplifyHotspot,
  ISuplifyHotspot
> {
  constructor() {
    super(SuplifyHotspot);
  }
}
