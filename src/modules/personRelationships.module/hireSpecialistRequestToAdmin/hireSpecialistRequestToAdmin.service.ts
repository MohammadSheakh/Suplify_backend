//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { HireSpecialistRequestToAdmin } from './hireSpecialistRequestToAdmin.model';
import { IHireSpecialistRequestToAdmin } from './hireSpecialistRequestToAdmin.interface';
import { GenericService } from '../../_generic-module/generic.services';

export class HireSpecialistRequestToAdminService extends GenericService<
  typeof HireSpecialistRequestToAdmin,
  IHireSpecialistRequestToAdmin
> {
  constructor() {
    super(HireSpecialistRequestToAdmin);
  }
}
