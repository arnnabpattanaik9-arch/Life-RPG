import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Your hero needs a name.').max(50, 'Name cannot exceed 50 characters.'),
  email: z.string().trim().email('Enter a valid email address.').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').toLowerCase(),
  password: z.string().min(1, 'Password is required.'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
