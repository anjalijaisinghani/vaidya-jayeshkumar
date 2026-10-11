import { Router } from 'express';
import { login, logout, me } from '../controllers/authController.js';
import { updateAccountDetails, changePassword } from '../controllers/accountController.js';
import {
  getDashboard,
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/adminPostController.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminCategoryController.js';
import { updateProfile } from '../controllers/adminProfileController.js';
import { requireAuth } from '../middleware/auth.js';
import { originCheck } from '../middleware/originCheck.js';
import { loginLimiter, accountLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Admin responses must never be cached.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
router.use(originCheck);

// --- Routes that work without being logged in ---
router.post('/auth/login', loginLimiter, login);
router.post('/auth/logout', logout);
router.get('/auth/me', requireAuth, me);

// --- Everything below this line requires a logged-in admin ---
router.use(requireAuth);

router.patch('/account', accountLimiter, updateAccountDetails);
router.patch('/account/password', accountLimiter, changePassword);

router.get('/dashboard', getDashboard);

router.get('/posts', listPosts);
router.post('/posts', createPost);
router.get('/posts/:id', getPost);
router.patch('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);

router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.patch('/profile', updateProfile);

export default router;