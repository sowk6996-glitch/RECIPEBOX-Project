import express from 'express';
import { followUser, unfollowUser, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/follow/:id', protect, followUser);
router.post('/unfollow/:id', protect, unfollowUser);
router.get('/:id/profile', getUserProfile);

export default router;
