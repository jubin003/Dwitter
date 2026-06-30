import dotenv from 'dotenv';
dotenv.config();

import Express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';

import authRoutes from './routes/auth.route.js';
import tweetRoutes from './routes/tweet.route.js';
import userRoutes from './routes/user.route.js';
import likeRoutes from './routes/like.route.js';

const app = Express();

app.use(Express.json());
app.use(helmet());
app.use(cors({
    origin: process.env.FRONT_END_URL,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'authorization']
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tweets', tweetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/likes', likeRoutes);

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://highfrag6081_db_user:jubin007@dwittercluster0.rlbutwv.mongodb.net/?appName=dwittercluster0")
    .then(() => {
        console.log('Connected to DB');
        app.listen(3000, () => {
            console.log('Server running on port 3000.');
        });
    })
    .catch((err) => {
        console.log('Could not connect to DB:', err.message);
    });
