import Express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTweetSchema } from '../validations/tweet.validation.js';
import {
    getAllTweets,
    getTweetById,
    getUserTweets,
    createTweet,
    updateTweet,
    deleteTweet
} from '../controllers/tweet.controller.js';

const router = Express.Router();

// Public
router.get('/', getAllTweets);
router.get('/user/:userId', getUserTweets);
router.get('/:id', getTweetById);

// Protected
router.post('/', protect, validate(createTweetSchema), createTweet);
router.patch('/:id', protect, validate(createTweetSchema), updateTweet);
router.delete('/:id', protect, deleteTweet);

export default router;
