import { z } from 'zod';

export const createHabitSchema = z.object({
  title: z.string().trim().min(1, 'Habit title is required.').max(80, 'Title cannot exceed 80 characters.'),
  notes: z.string().trim().max(240, 'Notes cannot exceed 240 characters.').optional(),
  attribute: z.enum(['strength', 'intellect', 'vitality', 'agility', 'charisma'], {
    errorMap: () => ({ message: 'Invalid attribute type.' }),
  }),
  frequency: z.enum(['daily', 'weekly'], {
    errorMap: () => ({ message: 'Invalid frequency.' }),
  }).default('daily'),
});

export const habitIdParamSchema = z.object({
  id: z.string().uuid('Invalid habit ID format.'),
});

export type CreateHabitDto = z.infer<typeof createHabitSchema>;
