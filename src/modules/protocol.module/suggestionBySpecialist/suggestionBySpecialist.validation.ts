//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import { z } from 'zod';

export const createSuggestionValidationSchema = z.object({
  body:  
  
  //---------------------------------
  // as we want to recieve an array of suggestions
  // so that we can perform bulk insertion for better performance
  //---------------------------------

  z.array( 
    z.object({
      keyPoint: z
        .string({
          required_error: 'keyPoint is required, keyPoint must be a string.',
          invalid_type_error: 'keyPoint must be a string.',
        })
        .min(2, {
        message: 'keyPoint must be at least 2 characters long.',
      })
      // .max(700, { // TODO : MUST : max is not working .. giving error in frontend 
      //   message: 'keyPoint must be at most 700 characters long.',
      // })
      ,

      solutionName: z
        .string({
          required_error: 'solutionName is required, solutionName must be a string.',
          invalid_type_error: 'solutionName must be a string.',
        })
        .min(2, {
        message: 'solutionName must be at least 2 characters long.',
      })
      // .max(700, {
      //   message: 'solutionName must be at most 700 characters long.',
      // })
      ,

      suggestFromStore: z
        .string({
          required_error: 'suggestFromStore is required, suggestFromStore must be a string.',
          invalid_type_error: 'suggestFromStore must be a string.',
        })
        .min(2, {
        message: 'suggestFromStore must be at least 2 characters long.',
      })
      // .max(700, {
      //   message: 'suggestFromStore must be at most 700 characters long.',
      // })
      ,

      // planByDoctorId: z.string({
      //     required_error: 'planByDoctorId is required', // as suggestion must be for a plan
      //     invalid_type_error: 'planByDoctorId must be a mongoose object.',
      //   }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      //     message: 'planByDoctorId must be a valid mongoose ObjectId.',
      //   }),
    })
  ),

  // params: z.object({
  //   id: z.string().optional(),
  // }),
  // query: z.object({
  //   page: z.string().optional(),
  // }),
   
});






