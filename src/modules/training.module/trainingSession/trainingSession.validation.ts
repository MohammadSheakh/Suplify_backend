import mongoose from 'mongoose';
import { z } from 'zod';
import { TDurationUnit } from './trainingSession.constant';

// Reusable ObjectId string validation
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const ObjectIdSchema = z.string().regex(objectIdRegex, { message: 'Invalid ObjectId format' });

export const createTrainingSessionValidationSchema = z.object({
  body: z.object({
    
    trainingProgramId: z.string({
        required_error: 'trainingProgramId is required.',
        invalid_type_error: 'trainingProgramId must be a mongoose object.',
      }).refine(value => mongoose.Types.ObjectId.isValid(value), {
        message: 'trainingProgramId must be a valid mongoose ObjectId.',
      }),
    title: z
      .string({ required_error: 'title is required', invalid_type_error: 'title must be a string' })
      .min(2, { message: 'title must be at least 2 characters long' })
      .max(200, { message: 'title must be at most 200 characters long' }),

    // may be it should be number 
    duration: z.string({
      required_error: 'duration is required.',
      invalid_type_error: 'duration must be a string.',
    }).refine(value => !isNaN(Number(value)), {
      message: 'duration must be a valid number.',
    }),

    durationUnit: z.enum([
      TDurationUnit.hours,
      TDurationUnit.minutes
    ], {
      required_error: 'durationUnit is required.',
      invalid_type_error: 'durationUnit must be a valid option',
    }),

    /**
     * 🟡 benefits - array of non-empty strings
     */
    benefits: z
      .array(z.string().min(1, 
        { message: 'Each benefit must be a non-empty string' }))
      .min(1, { message: 'benefits array must have at least one item' }),
    
    tokenCount: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .default(1),

    /**
     * Optional: coverPhotos - array of ObjectIds referencing Attachment
     */
    coverPhotos: z
      .array(ObjectIdSchema)
      .optional()
      .default([]),

    /**
     * Optional: attachments - array of ObjectIds referencing Attachment
     */
    attachments: z
      .array(ObjectIdSchema)
      .optional()
      .default([]),

    /**
     * Optional: external_link (URL format recommended)
     */
    external_link: z
      .string()
      .url({ message: 'external_link must be a valid URL' })
      .optional()
      .nullable()
      .or(z.literal('').transform(() => null)) // Allow empty string to be treated as null
      .optional(),

    /**
     * Optional: trailerContent - array of Attachment ObjectIds
     */
    trailerContent: z
      .array(ObjectIdSchema)
      .optional()
      .default([]),

  }),
});



