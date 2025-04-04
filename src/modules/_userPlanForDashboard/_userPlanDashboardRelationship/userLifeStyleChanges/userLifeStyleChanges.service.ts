
import { GenericService } from '../../../__Generic/generic.services';
import { UserLifeStyleChanges } from './userLifeStyleChanges.model';


export class UserLifeStyleChangesService extends GenericService<
  typeof UserLifeStyleChanges
> {
  constructor() {
    super(UserLifeStyleChanges);
  }
}
