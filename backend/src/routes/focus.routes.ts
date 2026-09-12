import { Router } from 'express';
import { completeFocusSession } from '../controllers/focus.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { completeFocusSchema } from '../schemas/focus.schema.js';

const router = Router();

router.use(requireAuth);

router.post('/complete', validateBody(completeFocusSchema), completeFocusSession);

export default router;
