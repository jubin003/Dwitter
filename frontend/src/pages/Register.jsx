import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../api/api';
import toast from 'react-hot-toast';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/feed');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username.trim(), email.trim(), password, bio.trim());
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Try again.');
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Grid Light Accent */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

        {/* Center pill */}
        <div className="flex justify-center mb-6">
          <span className="px-3 py-1 bg-zinc-800/60 border border-zinc-750 text-zinc-400 text-xs font-mono rounded-full uppercase tracking-wider animate-soft">
            Join Dwitter
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            dwitter<span className="text-zinc-500 font-normal">.dev</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            Create an account to start sharing.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Username
            </label>
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-650 focus:border-zinc-500 focus:ring-0 text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-650 focus:border-zinc-500 focus:ring-0 text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-650 focus:border-zinc-500 focus:ring-0 text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Bio (Optional)
            </label>
            <textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={loading}
              className="w-full min-h-[60px] bg-zinc-950/70 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-650 focus:border-zinc-500 focus:ring-0 text-sm outline-none transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3 px-4 rounded-xl text-sm hover:bg-zinc-200 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 pt-6 border-t border-zinc-800/60">
          <p className="text-zinc-500 text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-white hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
