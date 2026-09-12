import { Router } from 'express';
import authRouter from './auth.routes.js';
import characterRouter from './character.routes.js';
import questRouter from './quest.routes.js';
import shopRouter from './shop.routes.js';
import focusRouter from './focus.routes.js';
import habitRouter from './habit.routes.js';
import { toggleEquip } from '../controllers/shop.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { toggleEquipSchema } from '../schemas/shop.schema.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/character', characterRouter);
router.use('/quests', questRouter);
router.use('/shop', shopRouter);
router.use('/focus', focusRouter);
router.use('/habits', habitRouter);

// Alias route: /api/inventory/equip directly matches frontend's toggleEquip call
router.post('/inventory/equip', requireAuth, validateBody(toggleEquipSchema), toggleEquip);

export default router;
