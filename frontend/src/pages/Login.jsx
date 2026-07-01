import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, getMe } from '../api/api';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser, user } = useAuth();
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
      const res = await login(email, password);
      const token = res.data.token;
      
      // Store token in localStorage temporarily so interceptor pick it up for getMe
      localStorage.setItem('token', token);
      
      // Fetch user profile info
      const userRes = await getMe();
      
      // Log user in context
      loginUser(token, userRes.data);
      toast.success('Logged in successfully!');
      navigate('/feed');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password');
      toast.error(err.response?.data?.message || 'Login failed');
      // Cleanup token on error
      localStorage.removeItem('token');
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
            Welcome back
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            dwitter<span className="text-zinc-500 font-normal">.dev</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            Sign in to join the conversation.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-650 focus:border-zinc-500 focus:ring-0 text-sm outline-none transition-colors"
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
              className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-650 focus:border-zinc-500 focus:ring-0 text-sm outline-none transition-colors"
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
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 pt-6 border-t border-zinc-800/60">
          <p className="text-zinc-500 text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-white hover:underline font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;