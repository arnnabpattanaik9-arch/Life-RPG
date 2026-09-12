import { Router } from 'express';
import { signup, login, logout, me } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.js';
import { signupSchema, loginSchema } from '../schemas/auth.schema.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/signup', authLimiter, validateBody(signupSchema), signup);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', me);

export default router;
