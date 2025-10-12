//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import { z } from 'zod';

export const createLabTestBookingValidationSchema = z.object({
  body: z.object({
     labTestId: z.string({
        required_error: 'labTestId is required.',
        invalid_type_error: 'labTestId must be a mongoose object.',
      }).refine(value => mongoose.Types.ObjectId.isValid(value), {
        message: 'labTestId must be a valid mongoose ObjectId.',
      }),

    address: z  
      .string({
          required_error: 'message is required, message must be a string.',
          invalid_type_error: 'dateOfBirth must be a string.',
        }).min(5, {
        message: 'message must be at least 5 characters long.',
      }).max(500, {
        message: 'message must be at most 500 characters long.',
      }),
    city: z  
      .string({
          required_error: 'message is required, message must be a string.',
          invalid_type_error: 'dateOfBirth must be a string.',
        }).min(5, {
        message: 'message must be at least 5 characters long.',
      }).max(500, {
        message: 'message must be at most 500 characters long.',
      }),
    state: z  
    .string({
        required_error: 'message is required, message must be a string.',
        invalid_type_error: 'dateOfBirth must be a string.',
      }).min(5, {
      message: 'message must be at least 5 characters long.',
    }).max(500, {
      message: 'message must be at most 500 characters long.',
    }),
    zipCode: z  
    .string({
        required_error: 'message is required, message must be a string.',
        invalid_type_error: 'dateOfBirth must be a string.',
      }).min(5, {
      message: 'message must be at least 5 characters long.',
    }).max(500, {
      message: 'message must be at most 500 characters long.',
    }),


  }),

  // params: z.object({
  //   id: z.string().optional(),
  // }),
  // query: z.object({
  //   page: z.string().optional(),
  // }),
   
});






