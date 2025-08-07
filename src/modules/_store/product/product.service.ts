import { StatusCodes } from 'http-status-codes';
import { Product } from './Product.model';
import { IProduct } from './Product.interface';
import { GenericService } from '../__Generic/generic.services';


export class ProductService extends GenericService<
  typeof Product,
  IProduct
> {
  constructor() {
    super(Product);
  }
}
