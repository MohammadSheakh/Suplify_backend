//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import { z } from 'zod';

export const createOrderOfAOrderValidationSchema = z.object({
   body: z.object({
      cartId: z.string({
          required_error: 'cartId is required in query.',
          invalid_type_error: 'cartId must be a mongoose object.',
      }).refine(value => mongoose.Types.ObjectId.isValid(value), {
        message: 'cartId must be a valid mongoose ObjectId.',
      }),
      address:z.string({
        required_error: 'address is required.',
        invalid_type_error: 'address must be a string.',
      }),
      city: z.string({
        required_error: 'city is required.',
        invalid_type_error: 'city must be a string.',
      }),
      state: z.string({
        required_error: 'state is not required.',
        invalid_type_error: 'state must be a string.',
      }).optional(),
      zipCode: z.string({
        required_error: 'zipCode is not required.',
        invalid_type_error: 'zipCode must be a string.',
      }).optional(),
      country: z.string({
        required_error: 'country is not required.',
        invalid_type_error: 'country must be a string.',
      }).optional(),
   }),

  // params: z.object({
  //   cartId: z.string({
  //       required_error: 'cartId is required in params.',
  //       invalid_type_error: 'cartId must be a mongoose object.',
  //     }).refine(value => mongoose.Types.ObjectId.isValid(value), {
  //       message: 'cartId must be a valid mongoose ObjectId.',
  //     }),
  // }),
  // query: z.object({
  //   cartId: z.string({
  //       required_error: 'cartId is required in query.',
  //       invalid_type_error: 'cartId must be a mongoose object.',
  //     }).refine(value => mongoose.Types.ObjectId.isValid(value), {
  //       message: 'cartId must be a valid mongoose ObjectId.',
  //     }),
  // }),
   
});


export const updateOrderStatusValidationSchema = z.object({
   body: z.object({
      status: z.string({
        required_error: 'status is required.',
        invalid_type_error: 'status must be a string.',
      }),
   }),

  params: z.object({
    id: z.string({
        required_error: 'orderId is required in params.',
        invalid_type_error: 'orderId must be a mongoose object.',
      }).refine(value => mongoose.Types.ObjectId.isValid(value), {
        message: 'orderId must be a valid mongoose ObjectId.',
      }),
  }),
  // query: z.object({
  //   cartId: z.string({
  //       required_error: 'cartId is required in query.',
  //       invalid_type_error: 'cartId must be a mongoose object.',
  //     }).refine(value => mongoose.Types.ObjectId.isValid(value), {
  //       message: 'cartId must be a valid mongoose ObjectId.',
  //     }),
  // }),
   
});


