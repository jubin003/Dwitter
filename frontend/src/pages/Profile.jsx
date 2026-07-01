import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getProfile,
  getUserTweets,
  getLikedByUser,
  likeTweet,
  unlikeTweet,
  followUser,
  unfollowUser,
  updateProfile,
  getMe
} from '../api/api';
import Navbar from '../components/Navbar';
import TweetCard from '../components/TweetCard';
import toast from 'react-hot-toast';
import { Calendar, UserPlus, UserCheck, Edit3, X, Check, ArrowLeft } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [likedTweetIds, setLikedTweetIds] = useState(new Set());
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const currentUserId = user?._id || user?.id;
  const isOwnProfile = currentUserId === id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Fetch target user profile stats
        const profileRes = await getProfile(id);
        setProfile(profileRes.data);
        setBioInput(profileRes.data.bio || '');
        setUsernameInput(profileRes.data.username || '');

        // Fetch target user's tweets
        const tweetsRes = await getUserTweets(id);
        setTweets(tweetsRes.data);

        // Fetch logged-in user liked tweets to check like status
        if (user) {
          const likedRes = await getLikedByUser(currentUserId);
          const likedIds = new Set(likedRes.data.map((l) => l.tweetId?._id || l.tweetId));
          setLikedTweetIds(likedIds);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile');
        navigate('/feed');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, user, navigate, currentUserId]);

  // Check if logged-in user is following target user
  const isFollowing = profile?.followers?.some(
    (follower) => (follower._id || follower) === currentUserId
  );

  const handleFollowToggle = async () => {
    if (!profile || !user) return;

    try {
      if (isFollowing) {
        await unfollowUser(profile._id);
        toast.success(`Unfollowed ${profile.username}`);
        setProfile((prev) => ({
          ...prev,
          followers: prev.followers.filter(
            (follower) => (follower._id || follower) !== currentUserId
          )
        }));
      } else {
        await followUser(profile._id);
        toast.success(`Following ${profile.username}`);
        setProfile((prev) => ({
          ...prev,
          followers: [...prev.followers, { _id: currentUserId, username: user.username }]
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    setEditLoading(true);
    try {
      const res = await updateProfile(id, {
        username: usernameInput.trim(),
        bio: bioInput.trim()
      });
      
      toast.success('Profile updated successfully!');
      
      // Update local profile stats
      setProfile((prev) => ({
        ...prev,
        username: usernameInput.trim(),
        bio: bioInput.trim()
      }));

      // Update global context user details if they edited username/bio
      const updatedUserRes = await getMe();
      setUser(updatedUserRes.data);
      
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handleLikeToggle = async (tweetId) => {
    const isLiked = likedTweetIds.has(tweetId);
    
    // Optimistic UI updates
    setLikedTweetIds((prev) => {
      const next = new Set(prev);
      if (isLiked) {
        next.delete(tweetId);
      } else {
        next.add(tweetId);
      }
      return next;
    });

    setTweets((prevTweets) =>
      prevTweets.map((t) => {
        if (t._id === tweetId) {
          return {
            ...t,
            likes: isLiked ? Math.max(0, (t.likes || 0) - 1) : (t.likes || 0) + 1
          };
        }
        return t;
      })
    );

    try {
      if (isLiked) {
        await unlikeTweet(tweetId);
      } else {
        await likeTweet(tweetId);
      }
    } catch (err) {
      console.error(err);
      // Revert if API fails
      setLikedTweetIds((prev) => {
        const next = new Set(prev);
        if (isLiked) {
          next.add(tweetId);
        } else {
          next.delete(tweetId);
        }
        return next;
      });
      setTweets((prevTweets) =>
        prevTweets.map((t) => {
          if (t._id === tweetId) {
            return {
              ...t,
              likes: isLiked ? (t.likes || 0) + 1 : Math.max(0, (t.likes || 0) - 1)
            };
          }
          return t;
        })
      );
      toast.error('Failed to update like status');
    }
  };

  const handleTweetDeleted = (deletedId) => {
    setTweets((prev) => prev.filter((t) => t._id !== deletedId));
  };

  const handleTweetUpdated = (updatedTweet) => {
    setTweets((prev) =>
      prev.map((t) => (t._id === updatedTweet._id ? { ...t, content: updatedTweet.content } : t))
    );
  };

  const formatDate = (dateString) => {
    const options = { month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 bg-grid text-zinc-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-zinc-800 border-t-white rounded-full animate-spin"></div>
          <span className="text-zinc-500 text-sm tracking-wider uppercase animate-pulse">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6">
        {/* Back navigation */}
        <div className="mb-4">
          <Link to="/feed" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to feed
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              {/* Profile Avatar Big */}
              <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-extrabold text-3xl shadow-xl select-none shrink-0">
                {profile.username.charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{profile.username}</h1>
                <p className="text-zinc-500 text-sm mt-0.5">{profile.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-zinc-500 text-xs mt-2">
                  <Calendar size={13} />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="shrink-0 mt-2 sm:mt-0">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-750 text-white font-semibold py-2 px-4 rounded-xl text-xs border border-zinc-700 transition-all cursor-pointer"
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`flex items-center gap-1.5 font-semibold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer active:scale-95 ${
                    isFollowing
                      ? 'bg-zinc-850 hover:bg-zinc-800 text-white border border-zinc-800'
                      : 'bg-white hover:bg-zinc-200 text-black shadow-sm'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={13} /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus size={13} /> Follow
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* User Bio */}
          <div className="mt-5 border-t border-zinc-800/40 pt-4 text-center sm:text-left">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Bio</h3>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap italic">
              {profile.bio || '"No bio written yet"'}
            </p>
          </div>

          {/* Statistics */}
          <div className="flex justify-around sm:justify-start gap-10 mt-6 pt-5 border-t border-zinc-800/60 text-center sm:text-left">
            <div>
              <span className="block font-bold text-white text-lg">
                {profile.following?.length || 0}
              </span>
              <span className="text-zinc-500 text-xs uppercase tracking-wide">Following</span>
            </div>
            <div>
              <span className="block font-bold text-white text-lg">
                {profile.followers?.length || 0}
              </span>
              <span className="text-zinc-500 text-xs uppercase tracking-wide">Followers</span>
            </div>
            <div>
              <span className="block font-bold text-white text-lg">
                {tweets.length}
              </span>
              <span className="text-zinc-500 text-xs uppercase tracking-wide">Tweets</span>
            </div>
          </div>
        </div>

        {/* User tweets feed */}
        <div>
          <h2 className="text-base font-bold text-white mb-4 uppercase tracking-wider text-zinc-400">Tweets</h2>
          {tweets.length === 0 ? (
            <div className="bg-zinc-900/20 border border-zinc-900/60 rounded-xl py-12 text-center">
              <p className="text-zinc-500 text-sm">No tweets posted by this user.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tweets.map((tweet) => (
                <TweetCard
                  key={tweet._id}
                  tweet={tweet}
                  isLiked={likedTweetIds.has(tweet._id)}
                  onLikeToggle={handleLikeToggle}
                  onTweetDeleted={handleTweetDeleted}
                  onTweetUpdated={handleTweetUpdated}
                />
              ))}
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-zinc-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                <h2 className="text-lg font-bold text-white">Edit Profile Info</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    disabled={editLoading}
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:border-zinc-500 focus:ring-0 text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Bio
                  </label>
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    disabled={editLoading}
                    maxLength={160}
                    placeholder="Tell us about yourself..."
                    className="w-full min-h-[90px] bg-zinc-950/70 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-650 focus:border-zinc-500 focus:ring-0 text-sm outline-none transition-colors resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={editLoading}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-300 transition-all cursor-pointer"
                  >
                    <X size={13} /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading || !usernameInput.trim()}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer"
                  >
                    {editLoading ? (
                      <div className="w-4 h-4 border-2 border-zinc-450 border-t-black rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Check size={13} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
