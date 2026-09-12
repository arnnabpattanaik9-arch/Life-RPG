import { Router } from 'express';
import {
  listQuests,
  createQuest,
  updateQuest,
  deleteQuest,
  completeQuest,
} from '../controllers/quest.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  createQuestSchema,
  updateQuestSchema,
  questIdParamSchema,
} from '../schemas/quest.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/', listQuests);
router.post('/', validateBody(createQuestSchema), createQuest);
router.patch('/:id', validateParams(questIdParamSchema), validateBody(updateQuestSchema), updateQuest);
router.delete('/:id', validateParams(questIdParamSchema), deleteQuest);
router.post('/:id/complete', validateParams(questIdParamSchema), completeQuest);

export default router;
