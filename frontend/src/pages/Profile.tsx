import React, { useState, useEffect } from 'react';
import api from '../api';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    age: 30,
    gender: 'MALE',
    height: 170.0,
    weight: 70.0,
    targetWeight: 65.0,
    activityLevel: 'SEDENTARY',
    goal: 'MAINTAIN'
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/profile');
      setProfile(res.data);
      setFormData({
        name: res.data.name || '',
        mobile: res.data.mobile || '',
        age: res.data.age || 30,
        gender: res.data.gender || 'MALE',
        height: res.data.height || 170.0,
        weight: res.data.weight || 70.0,
        targetWeight: res.data.targetWeight || 65.0,
        activityLevel: res.data.activityLevel || 'SEDENTARY',
        goal: res.data.goal || 'MAINTAIN'
      });
    } catch (err) {
      console.error(err);
      setError('Could not retrieve profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.put('/api/profile', formData);
      setProfile(res.data);
      setSuccess('Profile updated successfully!');
      
      // Update local storage user name
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = res.data.name;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
      console.error(err);
      setError('Failed to save profile details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs">Retrieving profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">User Profile</h2>
        <p className="text-slate-400 text-sm">Configure body metrics and track daily health calculations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric breakdown cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-800 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 flex items-center justify-center font-bold text-white text-3xl uppercase mx-auto mb-4">
              {formData.name ? formData.name[0] : 'U'}
            </div>
            <h3 className="font-extrabold text-lg text-slate-200">{formData.name || 'User'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{profile?.user?.email}</p>

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">BMI</span>
                <span className="font-bold text-slate-300">{profile?.bmi || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">BMR (Mifflin)</span>
                <span className="font-bold text-slate-300">{profile?.bmr || 'N/A'} kcal</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">TDEE (Daily Burn)</span>
                <span className="font-bold text-slate-300">{profile?.tdee || 'N/A'} kcal</span>
              </div>
            </div>
          </div>

          {/* Daily Goals Summary */}
          <div className="glass p-6 rounded-3xl border border-slate-800 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-300">Daily Target Targets</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-850">
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Calories</p>
                <p className="text-base font-extrabold text-green-400 mt-1">{profile?.dailyCalories || 'N/A'} kcal</p>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-850">
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Protein</p>
                <p className="text-base font-extrabold text-emerald-400 mt-1">{profile?.dailyProtein || 'N/A'} g</p>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-850">
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Carbohydrates</p>
                <p className="text-base font-extrabold text-blue-400 mt-1">{profile?.dailyCarbs || 'N/A'} g</p>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-850">
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Fats</p>
                <p className="text-base font-extrabold text-amber-400 mt-1">{profile?.dailyFat || 'N/A'} g</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-slate-800">
          <h3 className="font-extrabold text-base mb-6 text-slate-300">Modify Body Profile</h3>

          {success && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl text-center">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mobile Phone</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Age (Years)</label>
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
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Weight (kg)</label>
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
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Weight (kg)</label>
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
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Physical Activity Level</label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-slate-100"
              >
                <option value="SEDENTARY">Sedentary (Little/no exercise)</option>
                <option value="LIGHTLY_ACTIVE">Lightly Active (1-3 days/wk)</option>
                <option value="MODERATELY_ACTIVE">Moderately Active (3-5 days/wk)</option>
                <option value="VERY_ACTIVE">Very Active (6-7 days/wk)</option>
                <option value="EXTRA_ACTIVE">Extra Active (Gym twice/day)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary Goal</label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-slate-100"
              >
                <option value="LOSE_WEIGHT">Lose Weight (-500 kcal deficit)</option>
                <option value="MAINTAIN">Maintain Weight</option>
                <option value="GAIN_MUSCLE">Gain Muscle (+350 kcal surplus)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 font-bold rounded-xl shadow-glass shadow-green-500/20 transition duration-200"
            >
              {saving ? 'Calculating Metrics...' : 'Update & Recalculate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
