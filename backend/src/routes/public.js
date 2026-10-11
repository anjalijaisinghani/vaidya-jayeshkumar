import { Router } from 'express';
import {
  getProfile,
  getCategories,
  getPosts,
  getFeaturedPosts,
  getPostBySlug,
} from '../controllers/publicController.js';

const router = Router();

router.get('/profile', getProfile);
router.get('/categories', getCategories);
router.get('/posts/featured', getFeaturedPosts); // must come before /posts/:slug
router.get('/posts/:slug', getPostBySlug);
router.get('/posts', getPosts);

export default router;