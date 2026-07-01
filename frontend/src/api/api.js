import api from './axios';

// Auth Endpoints
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (username, email, password) => api.post('/auth/register', { username, email, password });
export const getMe = () => api.get('/auth/me');

// Tweet Endpoints
export const getAllTweets = () => api.get('/tweets');
export const getUserTweets = (userId) => api.get(`/tweets/user/${userId}`);
export const getTweetById = (id) => api.get(`/tweets/${id}`);
export const createTweet = (content) => api.post('/tweets', { content });
export const updateTweet = (id, content) => api.patch(`/tweets/${id}`, { content });
export const deleteTweet = (id) => api.delete(`/tweets/${id}`);

// User Endpoints
export const getProfile = (id) => api.get(`/users/${id}`);
export const getAllUsers = () => api.get('/users');
export const updateProfile = (id, data) => api.put(`/users/${id}`, data);
export const followUser = (id) => api.post(`/users/${id}/follow`);
export const unfollowUser = (id) => api.post(`/users/${id}/unfollow`);

// Like Endpoints
export const likeTweet = (tweetId) => api.post(`/likes/${tweetId}`);
export const unlikeTweet = (tweetId) => api.delete(`/likes/${tweetId}`);
export const getLikedByUser = (userId) => api.get(`/likes/user/${userId}`);
