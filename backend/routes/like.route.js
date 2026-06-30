import Express from 'express';
import { likeTweet, unlikeTweet, getTweetLikes, getLikedByUser } from '../controllers/like.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Express.Router();

// Public
router.get('/tweet/:tweetId', getTweetLikes);
router.get('/user/:userId', getLikedByUser);

// Protected
router.post('/:tweetId', protect, likeTweet);
router.delete('/:tweetId', protect, unlikeTweet);

export default router;
