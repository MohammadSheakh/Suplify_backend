import { StatusCodes } from 'http-status-codes';
import { Product } from './product.model';
import { IProduct } from './product.interface';
import { GenericService } from '../../__Generic/generic.services';


export class ProductService extends GenericService<
  typeof Product,
  IProduct
> {
  constructor() {
    super(Product);
  }
}
