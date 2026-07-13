import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import Toast from '../components/Toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('expired')) {
      setToast({ message: 'Session expired. Please log in again.', type: 'error' });
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        roles: response.data.roles
      }));
      setToast({ message: 'Success! Logged in.', type: 'success' });
      setTimeout(() => {
        navigate('/dashboard/home');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
      setToast({ message: err.response?.data?.message || 'Invalid email or password.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'user' | 'admin') => {
    setEmail(role === 'admin' ? 'admin@nutritrack.com' : 'user@nutritrack.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#070b19] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="glow-spot-green top-[20%] left-[20%]"></div>
      <div className="glow-spot-orange bottom-[20%] right-[20%]"></div>

      <div className="w-full max-w-md glass p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <span className="text-4xl">🥑</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm mt-1">Sign in to track your calories and fitness goals</p>
        </div>

        {searchParams.get('expired') && (
          <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs rounded-xl text-center">
            Your session has expired. Please log in again.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-500"
              placeholder="name@email.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs text-green-400 hover:underline">Forgot password?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 font-bold rounded-xl shadow-glass shadow-green-500/20 transition-all duration-200"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Section */}
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
          <p className="text-xs text-center text-slate-500 font-semibold uppercase tracking-wider">Quick Demo Login</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('user')}
              className="py-2.5 glass-light hover:bg-slate-800/40 border border-slate-800 text-xs rounded-xl transition duration-200"
            >
              Demo User
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="py-2.5 glass-light hover:bg-slate-800/40 border border-slate-800 text-xs rounded-xl transition duration-200"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <p className="text-sm text-center text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-400 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Login;
