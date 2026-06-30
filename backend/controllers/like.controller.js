import Like from '../models/like.model.js';
import Tweet from '../models/tweet.model.js';
import cache from '../cache/cache.js';

// POST /api/likes/:tweetId
export const likeTweet = async (req, res) => {
    try {
        const { tweetId } = req.params;
        const userId = req.auth.id;

        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            return res.status(404).json({ message: 'Tweet not found' });
        }

        // Check if already liked (likeSchema has unique index on userId+tweetId)
        const existingLike = await Like.findOne({ userId, tweetId });
        if (existingLike) {
            return res.status(400).json({ message: 'You have already liked this tweet' });
        }

        await Promise.all([
            Like.create({ userId, tweetId }),
            Tweet.findByIdAndUpdate(tweetId, { $inc: { likes: 1 } })
        ]);

        // Invalidate tweet caches
        cache.del(`tweet_${tweetId}`);
        cache.del('all_tweets');
        cache.del(`tweet_likes_${tweetId}`);

        res.status(201).json({ message: 'Tweet liked successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/likes/:tweetId
export const unlikeTweet = async (req, res) => {
    try {
        const { tweetId } = req.params;
        const userId = req.auth.id;

        const like = await Like.findOneAndDelete({ userId, tweetId });
        if (!like) {
            return res.status(404).json({ message: 'You have not liked this tweet' });
        }

        await Tweet.findByIdAndUpdate(tweetId, { $inc: { likes: -1 } });

        // Invalidate tweet caches
        cache.del(`tweet_${tweetId}`);
        cache.del('all_tweets');
        cache.del(`tweet_likes_${tweetId}`);

        res.status(200).json({ message: 'Tweet unliked successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/likes/:tweetId
export const getTweetLikes = async (req, res) => {
    try {
        const { tweetId } = req.params;
        const cacheKey = `tweet_likes_${tweetId}`;

        const cached = cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            return res.status(404).json({ message: 'Tweet not found' });
        }

        const likes = await Like.find({ tweetId })
            .populate('userId', 'username');

        const result = { count: likes.length, likes };
        cache.set(cacheKey, result);

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/likes/user/:userId  — all tweets liked by a user
export const getLikedByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const cacheKey = `likes_by_user_${userId}`;

        const cached = cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const likes = await Like.find({ userId })
            .populate('tweetId', 'content likes createdAt')
            .sort({ createdAt: -1 });

        cache.set(cacheKey, likes);
        res.status(200).json(likes);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
