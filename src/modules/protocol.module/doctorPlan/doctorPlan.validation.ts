//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import { z } from 'zod';
import { TPlanByDoctor } from '../planByDoctor/planByDoctor.constant';

export const createDoctorPlanValidationSchema = z.object({
  body: z.object({
    planType: z.enum([
      TPlanByDoctor.lifeStyleChanges,
      TPlanByDoctor.mealPlan,
      TPlanByDoctor.suppliment,
      TPlanByDoctor.workOut
    ],{
      required_error: 'typeOfLink is required.',
      invalid_type_error: 'typeOfLink must be a valid enum value.',
    }),

    title: z.string({
      required_error: 'title is required.',
      invalid_type_error: 'title must be a string.',
    }).min(2, 'title must be at least 2 characters long')
      .max(100, 'title must be at most 100 characters long'),
    
    description: z.string({
      required_error: 'description is required.',
      invalid_type_error: 'description must be a string.',
    }).min(10, 'description must be at least 10 characters long')
      .max(1000, 'description must be at most 1000 characters long'),
    
    keyPoints: z.array(
      z.string()
      .min(2)
      .max(200)
    ).min(1, 'At least one key point is required').
    max(20, 'A maximum of 20 key points are allowed'),

    // createdBy will be taken from the auth middleware (logged in user)
 
  }),

  // params: z.object({
  //   id: z.string().optional(),
  // }),
  // query: z.object({
  //   page: z.string().optional(),
  // }),
   
});

export const updateDoctorPlanValidationSchema = z.object({
  body: z.object({
    planType: z.enum([
      TPlanByDoctor.lifeStyleChanges,
      TPlanByDoctor.mealPlan,
      TPlanByDoctor.suppliment,
      TPlanByDoctor.workOut
    ],{
      required_error: 'typeOfLink is required.',
      invalid_type_error: 'typeOfLink must be a valid enum value.',
    }).optional(),

    title: z.string({
      required_error: 'title is required.',
      invalid_type_error: 'title must be a string.',
    }).min(2, 'title must be at least 2 characters long')
      .max(100, 'title must be at most 100 characters long').optional(),
    
    description: z.string({
      required_error: 'description is required.',
      invalid_type_error: 'description must be a string.',
    }).min(10, 'description must be at least 10 characters long')
      .max(1000, 'description must be at most 1000 characters long').optional(),
    
    keyPoints: z.array(
      z.string()
      .min(2)
      .max(200)
    ).min(1, 'At least one key point is required').
    max(20, 'A maximum of 20 key points are allowed').optional(),

    // createdBy will be taken from the auth middleware (logged in user)
 
  }),

  params: z.object({
    id: z.string().optional(),
  }),
  // query: z.object({
  //   page: z.string().optional(),
  // }),
   
});





