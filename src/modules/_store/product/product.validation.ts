import mongoose from 'mongoose';
import { z } from 'zod';
import { TProductCategory } from './product.constant';

export const createHelpMessageValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'name is required, name must be a string.',
        invalid_type_error: 'name must be a string.',
      })
      .min(5, {
        message: 'name must be at least 5 characters long.',
    }).max(500, {
      message: 'name must be at most 500 characters long.',
    }),
    
    description: z
      .string({
        required_error: 'description is required, description must be a string.',
        invalid_type_error: 'description must be a string.',
      })
      .min(5, {
        message: 'description must be at least 5 characters long.',
    }).max(1000, {
      message: 'description must be at most 500 characters long.',
    }),

    price: z
    .string({
      required_error: 'price is required, price must be a string.',
      invalid_type_error: 'price must be a string.',
    }),

    /***********
    price: z
      .number({
        required_error: 'price is required, price must be a number.',
        invalid_type_error: 'price must be a number.',
      })
      .min(0, {
        message: 'price must be at least 0.',
      }),

      ********* */

      category: z.string({
        required_error: 'category is required, category must be a string.',
        invalid_type_error: 'category must be a string.',
      }).refine(category => Object.keys(TProductCategory).includes(category as keyof typeof TProductCategory), {
        message: `category must be one of the following: ${Object.keys(TProductCategory).join(', ')}`,
      }),

    //  userId: z.string({
    //     required_error: 'id is required in params.',
    //     invalid_type_error: 'id must be a mongoose object.',
    //   }).refine(value => mongoose.Types.ObjectId.isValid(value), {
    //     message: 'id must be a valid mongoose ObjectId.',
    //   }),
  }),

  // params: z.object({
  //   id: z.string().optional(),
  // }),
  // query: z.object({
  //   page: z.string().optional(),
  // }),
   
});






