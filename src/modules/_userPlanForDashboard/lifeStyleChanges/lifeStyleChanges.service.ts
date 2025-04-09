import { GenericService } from '../../__Generic/generic.services';
import { ILifeStyleChanges } from './lifeStyleChanges.interface';
import { LifeStyleChanges } from './lifeStyleChanges.model';

export class LifeStyleChangesService extends GenericService<
  typeof LifeStyleChanges,
  ILifeStyleChanges
> {
  constructor() {
    super(LifeStyleChanges);
  }
}
