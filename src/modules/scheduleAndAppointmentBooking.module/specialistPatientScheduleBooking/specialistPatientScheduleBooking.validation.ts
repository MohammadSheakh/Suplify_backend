//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import { z } from 'zod';

export const specialistPatientScheduleBookingValidationSchema = z.object({
  // body: z.object({
    
  // }),

  params: z.object({
    // id: z.string().optional(),
    workoutClassId: z.string({
        required_error: 'workoutClassId is required in params.',
        invalid_type_error: 'workoutClassId must be a mongoose object.',
      }).refine(value => mongoose.Types.ObjectId.isValid(value), {
        message: 'workoutClassId must be a valid mongoose ObjectId.',
      }),
  }),
  // query: z.object({
  //   page: z.string().optional(),
  // }),
   
});






