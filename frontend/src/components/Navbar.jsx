import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, User, LogOut, MessageSquare } from 'lucide-react';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/feed" className="flex items-center gap-2 group">
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
            dwitter<span className="text-zinc-500 font-normal">.dev</span>
          </span>
        </Link>

        {/* Navigation */}
        {user && (
          <nav className="flex items-center gap-6">
            <Link
              to="/feed"
              className={`flex items-center gap-2 text-sm font-medium tracking-wide transition-all ${
                isActive('/feed')
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Home size={16} />
              <span className="hidden sm:inline">Feed</span>
            </Link>

            <Link
              to={`/profile/${user._id || user.id}`}
              className={`flex items-center gap-2 text-sm font-medium tracking-wide transition-all ${
                isActive(`/profile/${user._id || user.id}`)
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User size={16} />
              <span className="hidden sm:inline">Profile</span>
            </Link>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
