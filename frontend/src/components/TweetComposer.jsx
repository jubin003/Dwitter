import { useState } from 'react';
import { createTweet } from '../api/api';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

const TweetComposer = ({ onTweetCreated }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const maxLength = 280;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (content.length > maxLength) {
      toast.error('Tweet exceeds maximum length');
      return;
    }

    setLoading(true);
    try {
      const res = await createTweet(content.trim());
      setContent('');
      toast.success('Tweet posted successfully!');
      if (onTweetCreated) {
        // Pass the new tweet to parent
        onTweetCreated(res.data.tweet);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create tweet');
    } finally {
      setLoading(false);
    }
  };

  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 20 && remainingChars >= 0;

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-4 mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          className="w-full min-h-[90px] bg-transparent text-white border-0 placeholder-zinc-500 focus:ring-0 resize-none text-base outline-none"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        
        <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3">
          {/* Character counter */}
          <span
            className={`text-xs font-mono transition-colors duration-200 ${
              isOverLimit
                ? 'text-red-500 font-bold'
                : isNearLimit
                ? 'text-amber-500'
                : 'text-zinc-500'
            }`}
          >
            {remainingChars} / {maxLength}
          </span>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !content.trim() || isOverLimit}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold tracking-wide cursor-pointer transition-all duration-200 ${
              loading || !content.trim() || isOverLimit
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                : 'bg-white text-black hover:bg-zinc-200 active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Post</span>
                <Send size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TweetComposer;
