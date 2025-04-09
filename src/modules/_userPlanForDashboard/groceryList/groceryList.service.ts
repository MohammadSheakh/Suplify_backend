import { GenericService } from '../../__Generic/generic.services';
import { IGroceryList } from './groceryList.interface';
import { GroceryList } from './groceryList.model';

export class GroceryListService extends GenericService<
  typeof GroceryList,
  IGroceryList
> {
  constructor() {
    super(GroceryList);
  }
}
