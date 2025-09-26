//@ts-ignore
import { z } from 'zod';
//@ts-ignore
import mongoose from 'mongoose';

// Health & Performance Validation Schema
const healthAndPerformanceSchema = z.object({
  currentWeight: z.number({
    required_error: 'Current weight is required.',
    invalid_type_error: 'Current weight must be a number.',
  }).positive({
    message: 'Current weight must be a positive number.',
  }).min(30, {
    message: 'Current weight must be at least 30.',
  }).max(500, {
    message: 'Current weight must be at most 500.',
  }),

  bodyFatPercentage: z.number({
    required_error: 'Body fat percentage is required.',
    invalid_type_error: 'Body fat percentage must be a number.',
  }).min(3, {
    message: 'Body fat percentage must be at least 3%.',
  }).max(50, {
    message: 'Body fat percentage must be at most 50%.',
  }),

  waistMeasurement: z.number({
    required_error: 'Waist measurement is required.',
    invalid_type_error: 'Waist measurement must be a number.',
  }).positive({
    message: 'Waist measurement must be a positive number.',
  }).min(20, {
    message: 'Waist measurement must be at least 20.',
  }).max(100, {
    message: 'Waist measurement must be at most 100.',
  }),

  energyLevel: z.number({
    required_error: 'Energy level is required.',
    invalid_type_error: 'Energy level must be a number.',
  }).int({
    message: 'Energy level must be an integer.',
  }).min(1, {
    message: 'Energy level must be at least 1.',
  }).max(10, {
    message: 'Energy level must be at most 10.',
  }),

  sleepQuality: z.number({
    required_error: 'Sleep quality is required.',
    invalid_type_error: 'Sleep quality must be a number.',
  }).int({
    message: 'Sleep quality must be an integer.',
  }).min(1, {
    message: 'Sleep quality must be at least 1.',
  }).max(10, {
    message: 'Sleep quality must be at most 10.',
  }),

  workoutRecoveryRating: z.number({
    required_error: 'Workout recovery rating is required.',
    invalid_type_error: 'Workout recovery rating must be a number.',
  }).int({
    message: 'Workout recovery rating must be an integer.',
  }).min(1, {
    message: 'Workout recovery rating must be at least 1.',
  }).max(10, {
    message: 'Workout recovery rating must be at most 10.',
  }),
});

// Mindset & Momentum Validation Schema
const mindsetAndMomentumSchema = z.object({
  howMotivatedDoYouFeel: z.number({
    required_error: 'Motivation level is required.',
    invalid_type_error: 'Motivation level must be a number.',
  }).int({
    message: 'Motivation level must be an integer.',
  }).min(1, {
    message: 'Motivation level must be at least 1.',
  }).max(10, {
    message: 'Motivation level must be at most 10.',
  }),

  oneWinFromPastWeekThatYourProudOf: z.string({
    required_error: 'Win from past week is required.',
    invalid_type_error: 'Win from past week must be a string.',
  }).min(5, {
    message: 'Win from past week must be at least 5 characters long.',
  }).max(500, {
    message: 'Win from past week must be at most 500 characters long.',
  }),

  biggestChallengeofThisWeek: z.string({
    required_error: 'Biggest challenge is required.',
    invalid_type_error: 'Biggest challenge must be a string.',
  }).min(5, {
    message: 'Biggest challenge must be at least 5 characters long.',
  }).max(500, {
    message: 'Biggest challenge must be at most 500 characters long.',
  }),

  oneHabitYouImprovedOrBuiltThisWeek: z.string({
    required_error: 'Habit improvement is required.',
    invalid_type_error: 'Habit improvement must be a string.',
  }).min(5, {
    message: 'Habit improvement must be at least 5 characters long.',
  }).max(500, {
    message: 'Habit improvement must be at most 500 characters long.',
  }),

  howConfidentAreYou: z.number({
    required_error: 'Confidence level is required.',
    invalid_type_error: 'Confidence level must be a number.',
  }).int({
    message: 'Confidence level must be an integer.',
  }).min(1, {
    message: 'Confidence level must be at least 1.',
  }).max(10, {
    message: 'Confidence level must be at most 10.',
  }),
});

// Satisfaction & Feedback Validation Schema
const satisfactionAndFeedbackSchema = z.object({
  areYouHappyWithCurrentProgress: z.boolean({
    required_error: 'Progress satisfaction is required.',
    invalid_type_error: 'Progress satisfaction must be a boolean.',
  }),

  doYouFeelSupported: z.boolean({
    required_error: 'Support feeling is required.',
    invalid_type_error: 'Support feeling must be a boolean.',
  }),

  oneThingYouNeedHelpWith: z.string({
    required_error: 'Help needed is required.',
    invalid_type_error: 'Help needed must be a string.',
  }).min(5, {
    message: 'Help needed must be at least 5 characters long.',
  }).max(500, {
    message: 'Help needed must be at most 500 characters long.',
  }),

  oneHabitYouImprovedOrBuiltThisWeek: z.string({
    required_error: 'Habit improvement is required.',
    invalid_type_error: 'Habit improvement must be a string.',
  }).min(5, {
    message: 'Habit improvement must be at least 5 characters long.',
  }).max(500, {
    message: 'Habit improvement must be at most 500 characters long.',
  }),

  wouldYouRecommendUs: z.boolean({
    required_error: 'Recommendation is required.',
    invalid_type_error: 'Recommendation must be a boolean.',
  }),
});

// Adherence & Consistency Validation Schema
const adherenceAndConsistencySchema = z.object({
  didYouTakeSupplimentsAsRecommended: z.number({
    required_error: 'Supplement adherence is required.',
    invalid_type_error: 'Supplement adherence must be a number.',
  }).int({
    message: 'Supplement adherence must be an integer.',
  }).min(0, {
    message: 'Supplement adherence must be at least 0%.',
  }).max(100, {
    message: 'Supplement adherence must be at most 100%.',
  }),

  howManyMealsDidYouFollow: z.number({
    required_error: 'Meals followed is required.',
    invalid_type_error: 'Meals followed must be a number.',
  }).int({
    message: 'Meals followed must be an integer.',
  }).min(0, {
    message: 'Meals followed must be at least 0.',
  }).max(21, {
    message: 'Meals followed must be at most 21 (3 meals × 7 days).',
  }),

  workoutDidYouCompleteThisWeek: z.number({
    required_error: 'Workouts completed is required.',
    invalid_type_error: 'Workouts completed must be a number.',
  }).int({
    message: 'Workouts completed must be an integer.',
  }).min(0, {
    message: 'Workouts completed must be at least 0.',
  }).max(14, {
    message: 'Workouts completed must be at most 14 (2 per day max).',
  }),

  howConsistentWithHydration: z.number({
    required_error: 'Hydration consistency is required.',
    invalid_type_error: 'Hydration consistency must be a number.',
  }).int({
    message: 'Hydration consistency must be an integer.',
  }).min(1, {
    message: 'Hydration consistency must be at least 1.',
  }).max(10, {
    message: 'Hydration consistency must be at most 10.',
  }),

  checkInWithCoachThisWeek: z.boolean({
    required_error: 'Coach check-in status is required.',
    invalid_type_error: 'Coach check-in status must be a boolean.',
  }),
});

// Main Success Tracker Validation Schema for CREATE
export const createSuccessTrackerValidationSchema = z.object({
  body: z.object({
    healthAndPerformance: healthAndPerformanceSchema.optional(),
    mindsetAndMomentum: mindsetAndMomentumSchema.optional(),
    satisfactionAndFeedback: satisfactionAndFeedbackSchema.optional(),
    adherenceAndConsistency: adherenceAndConsistencySchema.optional(),
    
    userId: z.string({
      required_error: 'User ID is required.',
      invalid_type_error: 'User ID must be a string.',
      //@ts-ignore
    }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'User ID must be a valid mongoose ObjectId.',
    }),
    //@ts-ignore
  }).refine(data => {
    // At least one category must be provided
    const hasAnyCategory = data.healthAndPerformance || 
                          data.mindsetAndMomentum || 
                          data.satisfactionAndFeedback || 
                          data.adherenceAndConsistency;
    return hasAnyCategory;
  }, {
    message: 'At least one category (healthAndPerformance, mindsetAndMomentum, satisfactionAndFeedback, or adherenceAndConsistency) must be provided.',
  }),
});

// Update Success Tracker Validation Schema
export const updateSuccessTrackerValidationSchema = z.object({
  body: z.object({
    healthAndPerformance: healthAndPerformanceSchema.partial().optional(),
    mindsetAndMomentum: mindsetAndMomentumSchema.partial().optional(),
    satisfactionAndFeedback: satisfactionAndFeedbackSchema.partial().optional(),
    adherenceAndConsistency: adherenceAndConsistencySchema.partial().optional(),
  //@ts-ignore
  }).refine(data => {
    // At least one category must be provided
    const hasAnyCategory = data.healthAndPerformance || 
                          data.mindsetAndMomentum || 
                          data.satisfactionAndFeedback || 
                          data.adherenceAndConsistency;
    return hasAnyCategory;
  }, {
    message: 'At least one category to update must be provided.',
  }),

  params: z.object({
    id: z.string({
      required_error: 'Success tracker ID is required in params.',
      invalid_type_error: 'Success tracker ID must be a string.',
    //@ts-ignore
    }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'Success tracker ID must be a valid mongoose ObjectId.',
    }),
  }).optional(),
});

// Get Historical Data Validation Schema
export const getHistoricalDataValidationSchema = z.object({
  query: z.object({
    //@ts-ignore
    weeks: z.string().optional().refine(value => {
      if (!value) return true;
      const num = parseInt(value);
      return !isNaN(num) && num > 0 && num <= 52;
    }, {
      message: 'Weeks must be a valid number between 1 and 52.',
    }),
    //@ts-ignore
    page: z.string().optional().refine(value => {
      if (!value) return true;
      const num = parseInt(value);
      return !isNaN(num) && num > 0;
    }, {
      message: 'Page must be a valid positive number.',
    }),
    //@ts-ignore
    limit: z.string().optional().refine(value => {
      if (!value) return true;
      const num = parseInt(value);
      return !isNaN(num) && num > 0 && num <= 100;
    }, {
      message: 'Limit must be a valid number between 1 and 100.',
    }),
  }),
});

// Get Progress Trends Validation Schema
export const getProgressTrendsValidationSchema = z.object({
  query: z.object({
    //@ts-ignore
    weeks: z.string().optional().refine(value => {
      if (!value) return true;
      const num = parseInt(value);
      return !isNaN(num) && num >= 2 && num <= 52;
    }, {
      message: 'Weeks must be a valid number between 2 and 52 for trend analysis.',
    }),
    
    category: z.enum(['health', 'mindset', 'satisfaction', 'adherence', 'all'], {
      errorMap: () => ({ message: 'Category must be one of: health, mindset, satisfaction, adherence, all.' }),
    }).optional(),
  }),
});

// Get User Success Tracker Validation Schema
export const getUserSuccessTrackerValidationSchema = z.object({
  params: z.object({
    userId: z.string({
      required_error: 'User ID is required in params.',
      invalid_type_error: 'User ID must be a string.',
    //@ts-ignore
    }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'User ID must be a valid mongoose ObjectId.',
    }),
  }),
});

// Weekly Comparison Validation Schema
export const getWeeklyComparisonValidationSchema = z.object({
  query: z.object({
    //@ts-ignore
    currentWeek: z.string().optional().refine(value => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }, {
      message: 'Current week must be a valid date string.',
    }),
    //@ts-ignore
    compareWeek: z.string().optional().refine(value => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }, {
      message: 'Compare week must be a valid date string.',
    }),
  }),
});

// Bulk Create Success Tracker Validation Schema (for importing data)
export const bulkCreateSuccessTrackerValidationSchema = z.object({
  body: z.object({
    successTrackers: z.array(z.object({
      weekStartDate: z.string({
        required_error: 'Week start date is required.',
        invalid_type_error: 'Week start date must be a string.',
      //@ts-ignore
      }).refine(value => {
        const date = new Date(value);
        return !isNaN(date.getTime());
      }, {
        message: 'Week start date must be a valid date string.',
      }),
      
      healthAndPerformance: healthAndPerformanceSchema.optional(),
      mindsetAndMomentum: mindsetAndMomentumSchema.optional(),
      satisfactionAndFeedback: satisfactionAndFeedbackSchema.optional(),
      adherenceAndConsistency: adherenceAndConsistencySchema.optional(),
    })).min(1, {
      message: 'At least one success tracker entry is required.',
    }).max(10, {
      message: 'Maximum 10 success tracker entries allowed per bulk create.',
    }),
    
    userId: z.string({
      required_error: 'User ID is required.',
      invalid_type_error: 'User ID must be a string.',
    //@ts-ignore
    }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'User ID must be a valid mongoose ObjectId.',
    }),
  }),
});

// Export individual schemas for reuse
export {
  healthAndPerformanceSchema,
  mindsetAndMomentumSchema,
  satisfactionAndFeedbackSchema,
  adherenceAndConsistencySchema,
};