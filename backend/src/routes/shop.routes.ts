import { Router } from 'express';
import { getCatalog, purchaseItem, toggleEquip } from '../controllers/shop.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { purchaseItemSchema, toggleEquipSchema } from '../schemas/shop.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/catalog', getCatalog);
router.post('/purchase', validateBody(purchaseItemSchema), purchaseItem);
router.post('/equip', validateBody(toggleEquipSchema), toggleEquip);

export default router;
