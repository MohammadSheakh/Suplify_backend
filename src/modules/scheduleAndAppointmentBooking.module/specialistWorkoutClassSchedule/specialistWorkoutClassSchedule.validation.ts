import mongoose from 'mongoose';
import { z } from 'zod';

export const createHelpMessageValidationSchema = z.object({
  body: z.object({
    price: z  // TODO:  make this number 
    .string({
        required_error: 'message is required, message must be a string.',
        invalid_type_error: 'dateOfBirth must be a string.',
      }),

    scheduleDate: z.date({
        required_error: 'scheduleDate is required, scheduleDate must be a Date.',
        invalid_type_error: 'scheduleDate must be a Date.',
      }),

    startTime: z.date({
        required_error: 'startTime is required, startTime must be a Date.',
        invalid_type_error: 'startTime must be a Date.',
      }),

    endTime: z.date({
        required_error: 'endTime is required, endTime must be a Date.',
        invalid_type_error: 'endTime must be a Date.',
      }),

    scheduleName: z
      .string({
        required_error: 'scheduleName is required, scheduleName must be a string.',
        invalid_type_error: 'scheduleName must be a string.',
      })
      .min(2, {
        message: 'scheduleName must be at least 3 characters long.',
      })
      .max(100, {
        message: 'scheduleName must be at most 100 characters long.',
      }),

    description: z
      .string({
        required_error: 'description is required, description must be a string.',
        invalid_type_error: 'description must be a string.',
      })
      .min(10, {
        message: 'description must be at least 10 characters long.',
      })
      .max(1000, {
        message: 'description must be at most 1000 characters long.',
      }),

    typeOfLink: z.enum(['zoom', 'googleMeet', 'others'], {
        required_error: 'typeOfLink is required, typeOfLink must be a string.',
        invalid_type_error: 'typeOfLink must be a string.',
      }),

    meetingLink: z
      .string({
        required_error: 'meetingLink is required, meetingLink must be a string.',
        invalid_type_error: 'meetingLink must be a string.',
      })
      .min(10, {
        message: 'meetingLink must be at least 10 characters long.',
      })
      .max(1000, {
        message: 'meetingLink must be at most 1000 characters long.',
      }),

    //
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






