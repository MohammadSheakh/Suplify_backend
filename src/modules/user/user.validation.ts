import { z } from "zod";
import { Role, Roles } from '../../middlewares/roles';

const createUserValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required.',
        invalid_type_error: 'Name must be a string.',
      })
      .min(1, 'Name cannot be empty.'),
    
    email: z
      .string({
        required_error: 'Email is required.',
        invalid_type_error: 'Email must be a string.',
      })
      .email('Invalid email address.'),
    password: z
      .string({
        required_error: 'Password is required.',
        invalid_type_error: 'Password must be a string.',
      })
      .min(8, 'Password must be at least 8 characters long.'),
    role: z
      .string({
        required_error: 'Role is required.',
        invalid_type_error: 'Role must be a string.',
      })
      .refine(role => Roles.includes(role as Role), {
        message: `Role must be one of the following: ${Roles.join(', ')}`,
      }),
  }),
});


export const UserValidation = {
  createUserValidationSchema,
};
