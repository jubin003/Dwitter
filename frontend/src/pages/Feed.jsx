import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllTweets,
  getLikedByUser,
  likeTweet,
  unlikeTweet,
  getAllUsers,
  followUser,
  unfollowUser,
  getProfile
} from '../api/api';
import Navbar from '../components/Navbar';
import TweetComposer from '../components/TweetComposer';
import TweetCard from '../components/TweetCard';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sparkles, UserPlus, Check } from 'lucide-react';

const Feed = () => {
  const { user } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [likedTweetIds, setLikedTweetIds] = useState(new Set());
  const [usersToFollow, setUsersToFollow] = useState([]);
  const [profileStats, setProfileStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);

  useEffect(() => {
    const fetchFeedData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Fetch all tweets
        const tweetsRes = await getAllTweets();
        setTweets(tweetsRes.data);

        // Fetch user's liked tweets to mark hearts
        const likedRes = await getLikedByUser(user._id || user.id);
        const likedIds = new Set(likedRes.data.map((l) => l.tweetId?._id || l.tweetId));
        setLikedTweetIds(likedIds);

        // Fetch current user details to get following counts and following list
        const profileRes = await getProfile(user._id || user.id);
        setProfileStats(profileRes.data);
        const currentFollowing = profileRes.data.following.map(f => f._id || f);
        setFollowingIds(currentFollowing);

        // Fetch all users for "Who to Follow" recommendations
        const usersRes = await getAllUsers();
        // Filter out logged-in user and users already followed
        const list = usersRes.data.filter(
          (u) => 
            u._id !== (user._id || user.id) && 
            !currentFollowing.includes(u._id)
        );
        // Take top 5
        setUsersToFollow(list.slice(0, 5));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load feed');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, [user]);

  // Handle Like/Unlike toggle
  const handleLikeToggle = async (tweetId) => {
    const isLiked = likedTweetIds.has(tweetId);
    
    // Optimistic UI update
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
      // Revert if API call fails
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

  // Follow a recommended user
  const handleFollowUser = async (targetId, username) => {
    try {
      await followUser(targetId);
      toast.success(`You followed ${username}`);
      
      // Update local states
      setFollowingIds(prev => [...prev, targetId]);
      setUsersToFollow(prev => prev.filter(u => u._id !== targetId));
      
      // Update left side profile following stats count
      if (profileStats) {
        setProfileStats(prev => ({
          ...prev,
          following: [...prev.following, targetId]
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to follow user');
    }
  };

  // Callback when new tweet is created
  const handleTweetCreated = (newTweet) => {
    // Check if newTweet has full populated user object (it might only have userId as string from response)
    const formattedTweet = {
      ...newTweet,
      userId: {
        _id: user._id || user.id,
        username: user.username
      }
    };
    setTweets((prev) => [formattedTweet, ...prev]);
  };

  const handleTweetDeleted = (deletedId) => {
    setTweets((prev) => prev.filter((t) => t._id !== deletedId));
  };

  const handleTweetUpdated = (updatedTweet) => {
    setTweets((prev) =>
      prev.map((t) => (t._id === updatedTweet._id ? { ...t, content: updatedTweet.content } : t))
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Left Sidebar: Profile Snapshot */}
          <div className="md:col-span-1 hidden md:block">
            <div className="sticky top-22 bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-extrabold text-2xl mb-3 shadow-lg">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {user?.username}
                </h2>
                <p className="text-zinc-500 text-xs mt-1 truncate max-w-full">
                  {user?.email}
                </p>

                {profileStats && (
                  <p className="text-zinc-400 text-sm mt-3 line-clamp-3 italic">
                    {profileStats.bio || '"No bio written yet"'}
                  </p>
                )}

                {/* Follower info */}
                <div className="flex gap-4 w-full justify-around mt-4 pt-4 border-t border-zinc-800/60 text-center">
                  <div>
                    <span className="block font-bold text-white text-base">
                      {profileStats?.following?.length || 0}
                    </span>
                    <span className="text-zinc-500 text-xs uppercase tracking-wide">Following</span>
                  </div>
                  <div className="w-px h-8 bg-zinc-800/60"></div>
                  <div>
                    <span className="block font-bold text-white text-base">
                      {profileStats?.followers?.length || 0}
                    </span>
                    <span className="text-zinc-500 text-xs uppercase tracking-wide">Followers</span>
                  </div>
                </div>

                <Link
                  to={`/profile/${user?._id || user?.id}`}
                  className="w-full mt-5 block text-center bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Middle: Feed & Composer */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-zinc-400" />
              <h1 className="text-xl font-bold tracking-tight text-white">Home Feed</h1>
            </div>

            <TweetComposer onTweetCreated={handleTweetCreated} />

            {loading ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="w-8 h-8 border-3 border-zinc-800 border-t-white rounded-full animate-spin"></div>
                <span className="text-zinc-500 text-sm tracking-wider uppercase animate-pulse">Loading tweets...</span>
              </div>
            ) : tweets.length === 0 ? (
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl py-16 text-center">
                <p className="text-zinc-500 text-sm">No tweets posted yet. Be the first to post!</p>
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

          {/* Right Sidebar: Recommendations */}
          <div className="md:col-span-1 hidden lg:block">
            <div className="sticky top-22 bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                <UserPlus size={14} /> Who to Follow
              </h3>

              {usersToFollow.length === 0 ? (
                <p className="text-zinc-500 text-xs italic">No new users to follow.</p>
              ) : (
                <div className="space-y-4">
                  {usersToFollow.map((u) => (
                    <div key={u._id} className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-3 last:border-b-0 last:pb-0">
                      <div className="min-w-0">
                        <Link
                          to={`/profile/${u._id}`}
                          className="font-semibold text-white hover:underline truncate block text-sm"
                        >
                          {u.username}
                        </Link>
                        <p className="text-zinc-500 text-xs truncate max-w-[120px]">
                          {u.bio || 'Developer'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleFollowUser(u._id, u.username)}
                        className="bg-white hover:bg-zinc-200 text-black text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Feed;
