import { Router } from 'express';
import { login, logout, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { originCheck } from '../middleware/originCheck.js';
import { loginLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Admin responses must never be cached.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
router.use(originCheck);

router.post('/auth/login', loginLimiter, login);
router.post('/auth/logout', logout);
router.get('/auth/me', requireAuth, me);

export default router;