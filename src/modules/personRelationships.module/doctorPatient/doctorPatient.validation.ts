//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import { z } from 'zod';

export const assignDoctorForAPatientValidationSchema = z.object({
  body: z.object({
    patientId : z.string({
      required_error: 'patientId is required in params.',
      invalid_type_error: 'patientId must be a mongoose object.',
    }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'patientId must be a valid mongoose ObjectId.',
    }),

    doctorId : z.string({
      required_error: 'doctorId is required in params.',
      invalid_type_error: 'doctorId must be a mongoose object.',
    }).refine(value => mongoose.Types.ObjectId.isValid(value), {
      message: 'doctorId must be a valid mongoose ObjectId.',
    }),
  }),

  // params: z.object({
  //   id: z.string().optional(),
  // }),
  // query: z.object({
  //   page: z.string().optional(),
  // }),
   
});



export const getAllProtocolForADoctorFOrPatientValidationSchema = z.object({
  body: z.object({
    
  }),

  // params: z.object({
  //   doctorId: z.string(),
  //   patientId: z.string(),
  // }),
  query: z.object({
    doctorId: z.string(),
    patientId: z.string(),
  }),
   
});






