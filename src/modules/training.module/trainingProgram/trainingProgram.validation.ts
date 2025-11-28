//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import { z } from 'zod';

export const createTrainingProgramValidationSchema = z.object({
  body: z.object({
    programName: z  
    .string({
        required_error: 'programName is required, programName must be a string.',
        invalid_type_error: 'programName must be a string.',
      }).min(2, {
      message: 'programName must be at least 2 characters long.',
    }).max(200, {
      message: 'programName must be at most 200 characters long.',
    }),
    description: z  
    .string({
        required_error: 'description is required, description must be a string.',
        invalid_type_error: 'description must be a string.',
      }).min(2, {
      message: 'description must be at least 2 characters long.',
    }).max(700, {
      message: 'description must be at most 200 characters long.',
    }),
    totalSessionCount:z.string({ // TODO : make it number
      required_error: 'totalSessionCount is required, totalSessionCount must be a number.',
      invalid_type_error: 'totalSessionCount must be a number.',
    }).min(1, {
      message: 'totalSessionCount must be at least 1.',
    }),
    price: z.string({ // TODO : make it number
      required_error: 'price is required, price must be a number.',
      invalid_type_error: 'price must be a number.',
    }).min(0, {
      message: 'price must be a positive number.',
    }),
    durationInMonths: z.string({ // TODO : make it number
      required_error: 'durationInMonths is required, durationInMonths must be a number.',
      invalid_type_error: 'durationInMonths must be a number.',
    }).min(1, {
      message: 'durationInMonths must be at least 1.',
    }),
  }),

  // params: z.object({
  //   id: z.string().optional(),
  // }),
  // query: z.object({
  //   page: z.string().optional(),
  // }),
   
});


export const updateTrainingProgramValidationSchema = z.object({
  body: z.object({
    programName: z  
    .string({
        required_error: 'programName is required, programName must be a string.',
        invalid_type_error: 'programName must be a string.',
      }).min(2, {
      message: 'programName must be at least 2 characters long.',
    }).max(200, {
      message: 'programName must be at most 200 characters long.',
    }).optional(),

    description: z  
    .string({
        required_error: 'description is required, description must be a string.',
        invalid_type_error: 'description must be a string.',
      }).min(2, {
      message: 'description must be at least 2 characters long.',
    }).max(200, {
      message: 'description must be at most 200 characters long.',
    }).optional(),
    totalSessionCount:z.string({ // TODO : make it number
      required_error: 'totalSessionCount is required, totalSessionCount must be a number.',
      invalid_type_error: 'totalSessionCount must be a number.',
    }).min(1, {
      message: 'totalSessionCount must be at least 1.',
    }).optional(),
    price: z.string({ // TODO : make it number
      required_error: 'price is required, price must be a number.',
      invalid_type_error: 'price must be a number.',
    }).min(0, {
      message: 'price must be a positive number.',
    }).optional(),
    durationInMonths: z.string({ // TODO : make it number
      required_error: 'durationInMonths is required, durationInMonths must be a number.',
      invalid_type_error: 'durationInMonths must be a number.',
    }).optional(),
  }),

  // params: z.object({
  //   id: z.string().optional(),
  // }),
  // query: z.object({
  //   page: z.string().optional(),
  // }),
   
});






