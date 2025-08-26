import mongoose from 'mongoose';
import { z } from 'zod';

export const addToCartValidationSchema = z.object({
  body: z.object({
    itemId: z.string({
        required_error: 'itemId is required.',
        invalid_type_error: 'itemId must be a mongoose object.',
      }).refine(value => mongoose.Types.ObjectId.isValid(value), {
        message: 'itemId must be a valid mongoose ObjectId.',
      }),
  }),

  // params: z.object({
  //   id: z.string().optional(),
  // }),
  // query: z.object({
  //   page: z.string().optional(),
  // }),
   
});






