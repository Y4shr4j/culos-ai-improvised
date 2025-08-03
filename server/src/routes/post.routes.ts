import express from 'express';
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  archivePost
} from '../controllers/post.controller';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require admin authentication
router.use(isAuthenticated, isAdmin);

// Post routes
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

// Post status routes
router.patch('/:id/publish', publishPost);
router.patch('/:id/archive', archivePost);

export default router; 