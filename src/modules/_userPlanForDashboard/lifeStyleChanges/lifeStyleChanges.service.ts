import { GenericService } from '../../__Generic/generic.services';
import { LifeStyleChanges } from './lifeStyleChanges.model';

export class LifeStyleChangesService extends GenericService<
  typeof LifeStyleChanges
> {
  constructor() {
    super(LifeStyleChanges);
  }
}
