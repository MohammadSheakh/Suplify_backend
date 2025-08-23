import { FilterQuery, Schema } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../types/paginate';

// Plugin function for pagination
const paginate = <T>(schema: Schema<T>) => {
  schema.statics.paginate = async function (
    filter: FilterQuery<T>,
    options: PaginateOptions,
    populateOptions?: any,
    select?: string | string[]
  ): Promise<PaginateResult<T>> {
    const limit = options.limit ?? Number.MAX_SAFE_INTEGER; // ?? 10
    const page = options.page ?? 1;
    const skip = (page - 1) * limit;
    const sort = options.sortBy ?? 'createdAt';
    const countPromise = this.countDocuments(filter).exec();
    
    let query = this.find(filter).select(select).sort(sort).skip(skip).limit(limit);
    
    // TODO : This gives us exact Match .. we have to add partial match ..

    if (options.populate) {
      query = query.populate(options.populate);
    }

    if (populateOptions && populateOptions.length > 0) {
        
        // Check if it's the old format (array of strings)
        if (typeof populateOptions[0] === 'string') {
            // Old format: ['attachments', 'siteId']
            populateOptions.forEach(field => {
                query = query.populate(field as string);
            });
        } else {
            // New format: [{path: 'attachments', select: 'filename'}, ...]
            populateOptions.forEach(option => {
                query = query.populate(option);
            });
        }
    }

    const [totalResults, results] = await Promise.all([
      countPromise,
      query.exec(),
    ]);

    return {
      results,
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      totalResults,
    };
  };
};

export default paginate;
