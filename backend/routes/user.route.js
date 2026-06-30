import Express from 'express';
import {
    getAllUsers,
    getProfile,
    updateProfile,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Express.Router();

// Public
router.get('/', getAllUsers);
router.get('/:id', getProfile);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Protected
router.put('/:id', protect, updateProfile);
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);

export default router;
