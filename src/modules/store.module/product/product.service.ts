import { StatusCodes } from 'http-status-codes';
import { Product } from './product.model';
import { IProduct } from './product.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { TProductCategory } from './product.constant';
import { getOrSetRedisCache } from '../../../helpers/redis/getOrSetRedisCache';


export class ProductService extends GenericService<
  typeof Product,
  IProduct
> {
  constructor() {
    super(Product);
  }

  async categoryWithCount_WithoutCaching () {
    // const fitnessCount = await this.model.countDocuments({ category: TProductCategory.fitness });
    // const labTestCount = await this.model.countDocuments({ category: TProductCategory.labTest });
    // const supplimentCount = await this.model.countDocuments({ category: TProductCategory.supplement });
    // const wellnessCount = await this.model.countDocuments({ category: TProductCategory.wellness });
    // const othersCount = await this.model.countDocuments({ category: TProductCategory.others });

    /**********
     * 
     * this return the count of each category
     * 
     * ********* */
    const counts = await this.model.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    return {
      // fitness: fitnessCount,
      // labTest: labTestCount,
      // suppliment: supplimentCount,
      // wellness: wellnessCount,
      // others: othersCount,
      counts
    };
  }

  /********
   * 
   * with caching .. .. this is for example purpose only .. 
   * we use caching in controller .. 
   * 
   * ******** */
  async categoryWithCount () {

    const data = await getOrSetRedisCache(
      'productCategoryWithCount',
      async () => {
        return this.categoryWithCount_WithoutCaching();
      },
      3600 // 1 hour TTL
    );

    /*
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
    */
    return data;
  }

  /*******
   * 
   * (Landing Page) : E-Commerce 
   * 
   * ****** */
  async showAllCategoryAndItsLimitedProducts() {
    const result = await this.model.aggregate([
      /************   here based on patients subscription .. we show labTest  // TODO :::: 
      {
        $match: {
          ...(userName === "Sheakh" && { category: { $ne: "basketBall" } })
        },
      },
      ********* */
      {
        $group: {
          _id: "$category",
          products: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          category: "$_id",
          products: { $slice: ["$products", 5] }, // Limit to 5 products per category
        },
      },
    ]);

    return result;
  }

  /***********
 * 
 * ( Landing Page ) |  get-product-details-with-related-products  //[][🧑‍💻][🧪] //🚧✅ 🆗
 * 
 * ********** */
  async getProductDetailsWithRelatedProducts(productId: string) {
    console.log("🟢", productId);
    const result = await this.model.findById(productId);

    const relatedProducts = await this.model.find({ category: result.category,
      _id: { $ne: productId }
     }).limit(5);

    return { product: result, relatedProducts };
  }

  // add more service here if needed or override the existing ones
}
