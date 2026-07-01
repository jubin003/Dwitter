import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

// Simple redirection for base path
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 bg-grid flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-850 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }
  return user ? <Navigate to="/feed" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'glass-panel text-white border-zinc-800 text-sm font-medium rounded-xl',
          style: {
            background: 'rgba(15, 15, 15, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f4f4f5',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#000000',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#000000',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
