import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cache from '../cache/cache.js';

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { username, email, password, bio } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            bio
        });

        if (user) {
            res.status(201).json({ message: `${username} account was created.` });
        } else {
            res.status(400).json({ message: `${username} account not created` });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'No user found with that email' });
        }
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            return res.status(400).json({ message: 'Wrong credentials' });
        }
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.status(200).json({ token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/auth/me  (protected)
export const getMe = async (req, res) => {
    try {
        const userId = req.auth.id;
        const cacheKey = `user_me_${userId}`;

        const cached = cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        cache.set(cacheKey, user);
        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
