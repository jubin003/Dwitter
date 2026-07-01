import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Trash2, Edit3, Check, X } from 'lucide-react';
import { deleteTweet, updateTweet } from '../api/api';
import toast from 'react-hot-toast';

const TweetCard = ({ tweet, isLiked, onLikeToggle, onTweetDeleted, onTweetUpdated }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.content);
  const [loading, setLoading] = useState(false);

  const tweetAuthor = tweet.userId;
  const authorId = tweetAuthor?._id || tweetAuthor;
  const authorUsername = tweetAuthor?.username || 'User';
  
  const isOwnTweet = user && (user._id === authorId || user.id === authorId);

  // Formatting date nicely
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editContent.trim() || editContent.trim() === tweet.content) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      const res = await updateTweet(tweet._id, editContent.trim());
      toast.success('Tweet updated!');
      setIsEditing(false);
      if (onTweetUpdated) {
        onTweetUpdated(res.data.tweet);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update tweet');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tweet?')) return;

    setLoading(true);
    try {
      await deleteTweet(tweet._id);
      toast.success('Tweet deleted');
      if (onTweetDeleted) {
        onTweetDeleted(tweet._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete tweet');
    } finally {
      setLoading(false);
    }
  };

  // Avatar letter
  const avatarLetter = authorUsername.charAt(0).toUpperCase();

  return (
    <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-4 mb-4 transition-all duration-300 hover:border-zinc-700/80">
      <div className="flex gap-3">
        {/* User Avatar */}
        <Link to={`/profile/${authorId}`} className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold select-none hover:bg-zinc-700 transition-colors">
            {avatarLetter}
          </div>
        </Link>

        {/* Card Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header Info */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <Link
                to={`/profile/${authorId}`}
                className="font-semibold text-white hover:underline truncate text-sm sm:text-base"
              >
                {authorUsername}
              </Link>
              <span className="text-zinc-500 text-xs sm:text-sm">·</span>
              <span className="text-zinc-500 text-xs sm:text-sm truncate">
                {formatDate(tweet.createdAt)}
              </span>
            </div>

            {/* Actions for Author */}
            {isOwnTweet && !isEditing && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                  className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-all cursor-pointer"
                  title="Edit Tweet"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-all cursor-pointer"
                  title="Delete Tweet"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Tweet Text / Edit Area */}
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="mt-2">
              <textarea
                className="w-full min-h-[70px] bg-zinc-950 text-white border border-zinc-800 rounded-lg p-2.5 placeholder-zinc-600 focus:border-zinc-600 focus:ring-0 text-sm outline-none resize-none"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={280}
                required
                disabled={loading}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(tweet.content);
                  }}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer"
                >
                  <X size={12} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !editContent.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  <Check size={12} />
                  Save
                </button>
              </div>
            </form>
          ) : (
            <p className="text-zinc-200 text-sm sm:text-base leading-relaxed break-words whitespace-pre-line mt-1">
              {tweet.content}
            </p>
          )}

          {/* Tweet Footer / Like Count */}
          {!isEditing && (
            <div className="flex items-center gap-4 mt-3 border-t border-zinc-850 pt-2 shrink-0">
              <button
                onClick={() => onLikeToggle(tweet._id)}
                className={`flex items-center gap-1.5 text-xs font-semibold tracking-wider transition-colors cursor-pointer group ${
                  isLiked
                    ? 'text-red-500'
                    : 'text-zinc-500 hover:text-red-400'
                }`}
              >
                <span className="p-1 rounded-full group-hover:bg-red-500/10 transition-colors">
                  <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                </span>
                <span>{tweet.likes || 0}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetCard;
