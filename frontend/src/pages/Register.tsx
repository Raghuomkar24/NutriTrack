import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Toast from '../components/Toast';

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    mobile: '',
    age: 28,
    gender: 'MALE',
    height: 180,
    weight: 80,
    targetWeight: 75,
    activityLevel: 'MODERATELY_ACTIVE',
    goal: 'LOSE_WEIGHT',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && (!formData.email || !formData.password || !formData.name)) {
      setError('Please fill in all core fields.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/auth/register', formData);
      // Auto log in after register
      const response = await api.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        roles: response.data.roles
      }));
      setToast({ message: 'Registration complete! Welcome to NutriTrack Pro.', type: 'success' });
      setTimeout(() => {
        navigate('/dashboard/home');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
      setToast({ message: err.response?.data?.message || 'Registration failed. Try again.', type: 'error' });
      setStep(1); // Return to first step to check inputs
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b19] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="glow-spot-green top-[10%] left-[10%]"></div>
      <div className="glow-spot-orange bottom-[10%] right-[10%]"></div>

      <div className="w-full max-w-lg glass p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 animate-fade-in">
        <div className="text-center mb-6">
          <span className="text-4xl">🥑</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Get Started Free
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Step {step} of 2: {step === 1 ? 'Account Setup' : 'Body Metrics & Goals'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-500"
                placeholder="name@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password (Min. 6 characters)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-500"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mobile Phone (Optional)</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-500"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 font-bold rounded-xl shadow-glass shadow-green-500/25 transition duration-200 mt-2"
            >
              Continue to Body Metrics
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-slate-100"
                >
                  <option value="MALE" className="bg-slate-900">Male</option>
                  <option value="FEMALE" className="bg-slate-900">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target (kg)</label>
                <input
                  type="number"
                  name="targetWeight"
                  value={formData.targetWeight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Weekly Activity Level</label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-slate-100"
              >
                <option value="SEDENTARY" className="bg-slate-900">Sedentary (Little/no exercise)</option>
                <option value="LIGHTLY_ACTIVE" className="bg-slate-900">Lightly Active (1-3 days/wk)</option>
                <option value="MODERATELY_ACTIVE" className="bg-slate-900">Moderately Active (3-5 days/wk)</option>
                <option value="VERY_ACTIVE" className="bg-slate-900">Very Active (6-7 days/wk)</option>
                <option value="EXTRA_ACTIVE" className="bg-slate-900">Extra Active (Hard work/gym twice/day)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fitness Goal</label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-slate-100"
              >
                <option value="LOSE_WEIGHT" className="bg-slate-900">Lose Weight (-500 kcal deficit)</option>
                <option value="MAINTAIN" className="bg-slate-900">Maintain Weight</option>
                <option value="GAIN_MUSCLE" className="bg-slate-900">Gain Muscle (+350 kcal surplus)</option>
              </select>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 glass hover:bg-slate-800/60 font-bold rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 transition duration-200"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 bg-primary-500 hover:bg-primary-600 font-bold rounded-xl shadow-glass shadow-green-500/25 transition duration-200"
              >
                {loading ? 'Creating Account...' : 'Complete Sign Up'}
              </button>
            </div>
          </form>
        )}

        <p className="text-sm text-center text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-400 font-medium hover:underline">Log in</Link>
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

export default Register;
