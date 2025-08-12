import { StatusCodes } from 'http-status-codes';
import { Product } from './product.model';
import { IProduct } from './product.interface';
import { GenericService } from '../../__Generic/generic.services';
import { TProductCategory } from './product.constant';


export class ProductService extends GenericService<
  typeof Product,
  IProduct
> {
  constructor() {
    super(Product);
  }

  async categoryWithCount () {
    const fitnessCount = await this.model.countDocuments({ category: TProductCategory.fitness });
    const labTestCount = await this.model.countDocuments({ category: TProductCategory.labTest });
    const supplimentCount = await this.model.countDocuments({ category: TProductCategory.supplement });
    const wellnessCount = await this.model.countDocuments({ category: TProductCategory.wellness });
    const othersCount = await this.model.countDocuments({ category: TProductCategory.others });

    return {
      fitness: fitnessCount,
      labTest: labTestCount,
      suppliment: supplimentCount,
      wellness: wellnessCount,
      others: othersCount,
    };
  }

  // add more service here if needed or override the existing ones
}
