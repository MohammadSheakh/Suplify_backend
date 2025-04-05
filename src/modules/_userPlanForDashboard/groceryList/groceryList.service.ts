import { GenericService } from '../../__Generic/generic.services';
import { GroceryList } from './groceryList.model';


export class GroceryListService extends GenericService<
  typeof GroceryList
> {
  constructor() {
    super(GroceryList);
  }
}
