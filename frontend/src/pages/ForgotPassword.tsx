import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Leaf, Eye, EyeOff } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  // Step 1: email verification | Step 2: new password | 'done': success
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1 — verify email exists
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — set new password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email, newPassword });
      setStep('done');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF1E6] to-[#F4F3EE] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="glow-spot-green top-[20%] left-[20%] opacity-40"></div>
      <div className="glow-spot-orange bottom-[20%] right-[20%] opacity-40"></div>

      <div className="w-full max-w-md glass p-8 rounded-3xl border border-white/50 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary-50 border border-primary-200 text-primary-655 flex items-center justify-center shadow-md shadow-primary-500/10 mb-4 hover:scale-105 transition-transform duration-200">
            <Leaf size={24} className="stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            {step === 'done' ? 'All Done!' : 'Reset Password'}
          </h2>
          <p className="text-slate-650 text-sm mt-1 font-semibold">
            {step === 'email' && "Enter your email to verify your account"}
            {step === 'reset' && `Setting new password for ${email}`}
            {step === 'done' && 'Your password has been updated successfully'}
          </p>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step === 'email' || step === 'reset' ? 'bg-primary-500' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step === 'reset' ? 'bg-primary-500' : 'bg-slate-200'}`} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-primary-100 border border-primary-250 text-primary-700 text-xs rounded-xl text-center font-bold">
            {error}
          </div>
        )}

        {/* STEP 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 placeholder-slate-400 font-medium"
                placeholder="name@email.com"
                required
                autoFocus
              />
            </div>
            <button
              id="verify-email-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-card transition-all duration-200 active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify Email →'}
            </button>
          </form>
        )}

        {/* STEP 2: New Password */}
        {step === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl glass-input text-slate-800 placeholder-slate-400 font-medium"
                  placeholder="Min. 6 characters"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl glass-input text-slate-800 placeholder-slate-400 font-medium"
                  placeholder="Repeat your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); }}
                className="flex-1 py-3 bg-[#FFF1E6] border border-slate-300 text-slate-700 font-bold rounded-xl transition-all duration-200 active:scale-95 text-sm"
              >
                ← Back
              </button>
              <button
                id="reset-password-btn"
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-card transition-all duration-200 active:scale-95 disabled:opacity-60 text-sm"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        {/* DONE */}
        {step === 'done' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl">
              ✅
            </div>
            <p className="text-sm text-slate-600 font-medium">
              Your password has been changed. You can now sign in with your new password.
            </p>
            <button
              id="go-to-login-btn"
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-card transition-all duration-200 active:scale-95"
            >
              Go to Sign In
            </button>
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
