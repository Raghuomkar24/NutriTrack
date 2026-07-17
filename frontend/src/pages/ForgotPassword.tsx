import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Check email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF1E6] to-[#F4F3EE] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="glow-spot-green top-[20%] left-[20%] opacity-40"></div>
      <div className="glow-spot-orange bottom-[20%] right-[20%] opacity-40"></div>

      <div className="w-full max-w-md glass p-8 rounded-3xl border border-white/50 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <span className="text-4xl">🥑</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            Recover Password
          </h2>
          <p className="text-slate-650 text-sm mt-1 font-semibold">Enter your email and we'll send reset instructions</p>
        </div>

        {message && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs rounded-xl text-center font-bold">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-primary-100 border border-primary-250 text-primary-700 text-xs rounded-xl text-center font-bold">
            {error}
          </div>
        )}

        {!message ? (
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-card transition-all duration-200 active:scale-95"
            >
              {loading ? 'Sending Link...' : 'Send Recovery Link'}
            </button>
          </form>
        ) : (
          <div className="text-center mt-6">
            <Link to="/login" className="px-6 py-2.5 bg-[#FFF1E6] border border-slate-350 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#FFE3D4] active:scale-95 transition">
              Return to Sign In
            </Link>
          </div>
        )}

        <p className="text-sm text-center text-slate-650 mt-6 font-semibold">
          Remembered your password?{' '}
          <Link to="/login" className="text-primary-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
