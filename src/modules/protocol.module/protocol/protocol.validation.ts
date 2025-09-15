import mongoose from 'mongoose';
import { z } from 'zod';

export const createProtocolValidationSchema = z.object({
  body: z.object({
    
     patientId: z.string({
        required_error: 'patientId is required.',
        invalid_type_error: 'patientId must be a mongoose object.',
      }).refine(value => mongoose.Types.ObjectId.isValid(value), {
        message: 'patientId must be a valid mongoose ObjectId.',
      }),
  }),

  // params: z.object({
  //   id: z.string().optional(),
  // }),
  // query: z.object({
  //   page: z.string().optional(),
  // }),
   
});






