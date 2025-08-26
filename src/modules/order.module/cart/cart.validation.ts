import mongoose from 'mongoose';
import { z } from 'zod';

export const viewCartItemsOfACartValidationSchema = z.object({
  // body: z.object({
    
     
  // }),

  // params: z.object({
  //   cartId: z.string({
  //       required_error: 'cartId is required in params.',
  //       invalid_type_error: 'cartId must be a mongoose object.',
  //     }).refine(value => mongoose.Types.ObjectId.isValid(value), {
  //       message: 'cartId must be a valid mongoose ObjectId.',
  //     }),
  // }),
  query: z.object({
    cartId: z.string({
        required_error: 'cartId is required in query.',
        invalid_type_error: 'cartId must be a mongoose object.',
      }).refine(value => mongoose.Types.ObjectId.isValid(value), {
        message: 'cartId must be a valid mongoose ObjectId.',
      }),
  }),
   
});






