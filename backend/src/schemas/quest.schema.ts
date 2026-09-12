import { z } from 'zod';

export const createQuestSchema = z.object({
  title: z.string().trim().min(1, 'Quest title is required.').max(80, 'Title cannot exceed 80 characters.'),
  notes: z.string().trim().max(240, 'Notes cannot exceed 240 characters.').optional(),
  attribute: z.enum(['strength', 'intellect', 'vitality', 'agility', 'charisma'], {
    errorMap: () => ({ message: 'Invalid attribute type.' }),
  }),
  difficulty: z.enum(['trivial', 'easy', 'medium', 'hard', 'epic'], {
    errorMap: () => ({ message: 'Invalid difficulty level.' }),
  }),
  type: z.enum(['quest', 'daily'], {
    errorMap: () => ({ message: 'Invalid quest type.' }),
  }),
});

export const updateQuestSchema = createQuestSchema.partial();

export const questIdParamSchema = z.object({
  id: z.string().uuid('Invalid quest ID format.'),
});

export type CreateQuestDto = z.infer<typeof createQuestSchema>;
export type UpdateQuestDto = z.infer<typeof updateQuestSchema>;
