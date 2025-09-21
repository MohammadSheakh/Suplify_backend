import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { MindsetAndMomentum } from './mindsetAndMomentum.model';
import { IMindsetAndMomentum } from './MindsetAndMomentum.interface';
import { MindsetAndMomentumService } from './mindsetAndMomentum.service';


export class MindsetAndMomentumController extends GenericController<
  typeof MindsetAndMomentum,
  IMindsetAndMomentum
> {
  MindsetAndMomentumService = new MindsetAndMomentumService();

  constructor() {
    super(new MindsetAndMomentumService(), 'MindsetAndMomentum');
  }

  // add more methods here if needed or override the existing ones 
}
