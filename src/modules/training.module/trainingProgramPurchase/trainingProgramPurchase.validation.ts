import mongoose from 'mongoose';
import { z } from 'zod';

export const purchaseTrainingProgramValidationSchema = z.object({
  body: z.object({
    trainingProgramId: z.string({
      required_error: 'trainingProgramId is required in params.',
      invalid_type_error: 'trainingProgramId must be a mongoose object.',
    }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'trainingProgramId must be a valid mongoose ObjectId.',
    }),
  }),

  // params: z.object({
  //   id: z.string().optional(),
  // }),
  // query: z.object({
  //   page: z.string().optional(),
  // }),
   
});






