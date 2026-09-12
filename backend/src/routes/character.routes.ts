import { Router } from 'express';
import { getCharacter } from '../controllers/character.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getCharacter);

export default router;
