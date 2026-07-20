import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import Toast from '../components/Toast';
import { Leaf } from 'lucide-react';

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
      const errorMsg = err.response?.data?.message || err.message || 'Login failed due to a network or server error.';
      setError(errorMsg);
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'user' | 'admin') => {
    setEmail(role === 'admin' ? 'admin@nutritrack.com' : 'user@nutritrack.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF1E6] to-[#F4F3EE] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="glow-spot-green top-[20%] left-[20%] opacity-40"></div>
      <div className="glow-spot-orange bottom-[20%] right-[20%] opacity-40"></div>

      <div className="w-full max-w-md glass p-8 rounded-3xl border border-white/50 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary-50 border border-primary-200 text-primary-655 flex items-center justify-center shadow-md shadow-primary-500/10 mb-4 hover:scale-105 transition-transform duration-200">
            <Leaf size={24} className="stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">Sign in to track your calories and fitness goals</p>
        </div>

        {searchParams.get('expired') && (
          <div className="mb-4 p-3 bg-primary-100 border border-primary-200 text-primary-600 text-xs rounded-xl text-center font-bold">
            Your session has expired. Please log in again.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-primary-100 border border-primary-250 text-primary-700 text-xs rounded-xl text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 placeholder-slate-400 font-medium"
              placeholder="name@email.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline font-bold">Forgot password?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 placeholder-slate-400 font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-card transition-all duration-200 active:scale-95"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Section */}
        <div className="mt-6 pt-6 border-t border-slate-300 space-y-3">
          <p className="text-xs text-center text-slate-600 font-semibold uppercase tracking-wider">Quick Demo Login</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('user')}
              className="py-2.5 glass hover:bg-white/70 border border-slate-350 text-xs rounded-xl font-bold text-slate-700 transition duration-200 active:scale-95"
            >
              Demo User
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="py-2.5 glass hover:bg-white/70 border border-slate-350 text-xs rounded-xl font-bold text-slate-700 transition duration-200 active:scale-95"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <p className="text-sm text-center text-slate-600 mt-6 font-semibold">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-bold hover:underline">Sign up</Link>
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
