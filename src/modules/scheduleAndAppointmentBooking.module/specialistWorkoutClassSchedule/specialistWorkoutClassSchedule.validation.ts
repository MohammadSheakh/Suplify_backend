import mongoose from 'mongoose';
import { z } from 'zod';
import { TMeetingLink, TSession } from './specialistWorkoutClassSchedule.constant';

export const createWorkoutClassSessionValidationSchema = z.object({
  body: z.object({
    price: z  // TODO:  make this number 
    .string({
        required_error: 'message is required, message must be a string.',
        invalid_type_error: 'dateOfBirth must be a string.',
      }),

    scheduleDate: z.string({ // TODO this should be date /*** in controller we convert this to date *** */
        required_error: 'scheduleDate is required, scheduleDate must be a string.',
        invalid_type_error: 'scheduleDate must be a string.',
      }),

    startTime: z.string({
        required_error: 'startTime is required, startTime must be a string.',
        invalid_type_error: 'startTime must be a string.',
      }),

    endTime: z.string({
        required_error: 'endTime is required, endTime must be a string.',
        invalid_type_error: 'endTime must be a string.',
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

    typeOfLink: z.enum([
      TMeetingLink.zoom,
      TMeetingLink.googleMeet, 
      TMeetingLink.others
    ], {
      required_error: 'typeOfLink is required, typeOfLink must be a string.',
      invalid_type_error: 'typeOfLink must be a string.',
    }),

    sessionType: z.enum([
      TSession.private,
      TSession.group
    ], {
      required_error: 'sessionType is required, sessionType must be a string.',
      invalid_type_error: 'sessionType must be a string.',
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

  }),

  // params: z.object({
  //   id: z.string().optional(),
  // }),
  // query: z.object({
  //   page: z.string().optional(),
  // }),
   
});






