import User from '../models/user.model.js';
import cache from '../cache/cache.js';

// GET /api/users/:id
export const getProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `user_profile_${id}`;

        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const user = await User.findById(id)
            .select('-password')
            .populate('followers', 'username')
            .populate('following', 'username');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        cache.set(cacheKey, user);
        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/users
export const getAllUsers = async (req, res) => {
    try {
        const cacheKey = 'all_users';

        const cached = cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        cache.set(cacheKey, users);
        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/users/:id
export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = req.auth.id;

        if (id !== requesterId) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        // Prevent password update via this route
        const { password, ...updateData } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Invalidate related caches
        cache.del(`user_profile_${id}`);
        cache.del('all_users');

        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/users/:id/follow
export const followUser = async (req, res) => {
    try {
        const { id } = req.params;           // user to follow
        const requesterId = req.auth.id;      // current logged-in user

        if (id === requesterId) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const [targetUser, currentUser] = await Promise.all([
            User.findById(id),
            User.findById(requesterId)
        ]);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const alreadyFollowing = currentUser.following.includes(id);
        if (alreadyFollowing) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        await Promise.all([
            User.findByIdAndUpdate(id, { $addToSet: { followers: requesterId } }),
            User.findByIdAndUpdate(requesterId, { $addToSet: { following: id } })
        ]);

        // Invalidate profile caches for both users
        cache.del(`user_profile_${id}`);
        cache.del(`user_profile_${requesterId}`);
        cache.del('all_users');

        res.status(200).json({ message: `You are now following ${targetUser.username}` });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/users/:id/unfollow
export const unfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = req.auth.id;

        if (id === requesterId) {
            return res.status(400).json({ message: 'You cannot unfollow yourself' });
        }

        const [targetUser, currentUser] = await Promise.all([
            User.findById(id),
            User.findById(requesterId)
        ]);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFollowing = currentUser.following.includes(id);
        if (!isFollowing) {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        await Promise.all([
            User.findByIdAndUpdate(id, { $pull: { followers: requesterId } }),
            User.findByIdAndUpdate(requesterId, { $pull: { following: id } })
        ]);

        cache.del(`user_profile_${id}`);
        cache.del(`user_profile_${requesterId}`);
        cache.del('all_users');

        res.status(200).json({ message: `You have unfollowed ${targetUser.username}` });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/users/:id/followers
export const getFollowers = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `user_followers_${id}`;

        const cached = cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const user = await User.findById(id)
            .select('username followers')
            .populate('followers', 'username bio');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        cache.set(cacheKey, user.followers);
        res.status(200).json(user.followers);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/users/:id/following
export const getFollowing = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `user_following_${id}`;

        const cached = cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const user = await User.findById(id)
            .select('username following')
            .populate('following', 'username bio');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        cache.set(cacheKey, user.following);
        res.status(200).json(user.following);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
