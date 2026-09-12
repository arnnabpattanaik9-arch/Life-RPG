import { Router } from 'express';
import {
  listHabits,
  createHabit,
  completeHabit,
  deleteHabit,
} from '../controllers/habit.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { createHabitSchema, habitIdParamSchema } from '../schemas/habit.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/', listHabits);
router.post('/', validateBody(createHabitSchema), createHabit);
router.post('/:id/complete', validateParams(habitIdParamSchema), completeHabit);
router.delete('/:id', validateParams(habitIdParamSchema), deleteHabit);

export default router;
