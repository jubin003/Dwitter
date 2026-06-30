import Tweet from '../models/tweet.model.js';
import cache from '../cache/cache.js';

// POST /api/tweets
export const createTweet = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.auth.id;

        const tweet = await Tweet.create({ content, userId });

        // Invalidate list caches since a new tweet was added
        cache.del('all_tweets');
        cache.del(`user_tweets_${userId}`);

        res.status(201).json({ message: 'Tweet created successfully', tweet });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/tweets
export const getAllTweets = async (req, res) => {
    try {
        const cacheKey = 'all_tweets';

        const cached = cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const tweets = await Tweet.find()
            .populate('userId', 'username')
            .sort({ createdAt: -1 });

        cache.set(cacheKey, tweets);
        res.status(200).json(tweets);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/tweets/:id
export const getTweetById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `tweet_${id}`;

        const cached = cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const tweet = await Tweet.findById(id).populate('userId', 'username');
        if (!tweet) {
            return res.status(404).json({ message: 'Tweet not found' });
        }

        cache.set(cacheKey, tweet);
        res.status(200).json(tweet);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/tweets/user/:userId
export const getUserTweets = async (req, res) => {
    try {
        const { userId } = req.params;
        const cacheKey = `user_tweets_${userId}`;

        const cached = cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const tweets = await Tweet.find({ userId })
            .populate('userId', 'username')
            .sort({ createdAt: -1 });

        cache.set(cacheKey, tweets);
        res.status(200).json(tweets);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/tweets/:id
export const updateTweet = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth.id;
        const { content } = req.body;

        const tweet = await Tweet.findById(id);
        if (!tweet) {
            return res.status(404).json({ message: 'Tweet not found' });
        }
        if (tweet.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this tweet' });
        }

        const updatedTweet = await Tweet.findByIdAndUpdate(
            id,
            { $set: { content } },
            { new: true, runValidators: true }
        ).populate('userId', 'username');

        // Invalidate affected caches
        cache.del(`tweet_${id}`);
        cache.del('all_tweets');
        cache.del(`user_tweets_${userId}`);

        res.status(200).json({ message: 'Tweet updated successfully', tweet: updatedTweet });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/tweets/:id
export const deleteTweet = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth.id;

        const tweet = await Tweet.findById(id);
        if (!tweet) {
            return res.status(404).json({ message: 'Tweet not found' });
        }
        if (tweet.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this tweet' });
        }

        await Tweet.findByIdAndDelete(id);

        // Invalidate affected caches
        cache.del(`tweet_${id}`);
        cache.del('all_tweets');
        cache.del(`user_tweets_${userId}`);

        res.status(200).json({ message: 'Tweet deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
