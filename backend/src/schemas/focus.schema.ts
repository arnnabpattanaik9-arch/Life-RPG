import { z } from 'zod';

export const completeFocusSchema = z.object({
  minutes: z.coerce.number().int().min(1, 'Session must be at least 1 minute.').max(240, 'Session cannot exceed 240 minutes.'),
});

export type CompleteFocusDto = z.infer<typeof completeFocusSchema>;
