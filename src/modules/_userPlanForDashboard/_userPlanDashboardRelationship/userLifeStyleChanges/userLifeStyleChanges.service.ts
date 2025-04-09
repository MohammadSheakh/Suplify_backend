
import { GenericService } from '../../../__Generic/generic.services';
import { IUserLifeStyleChanges } from './userLifeStyleChanges.interface';
import { UserLifeStyleChanges } from './userLifeStyleChanges.model';


export class UserLifeStyleChangesService extends GenericService<
  typeof UserLifeStyleChanges,
  IUserLifeStyleChanges
> {
  constructor() {
    super(UserLifeStyleChanges);
  }
}
