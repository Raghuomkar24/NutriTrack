import React, { useState, useEffect } from 'react';
import api from '../api';
import PopUpModal, { PopUpType } from '../components/PopUpModal';
import { RotateCcw, Camera } from 'lucide-react';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Pop Up Modal State with OK button for Profile CRUD operations
  const [popUp, setPopUp] = useState<{
    open: boolean;
    title: string;
    body: string;
    type: PopUpType;
  }>({
    open: false,
    title: '',
    body: '',
    type: 'success',
  });

  const showPopUp = (title: string, body: string, type: PopUpType = 'success') => {
    setPopUp({
      open: true,
      title,
      body,
      type,
    });
  };

  const closePopUp = () => {
    setPopUp(prev => ({ ...prev, open: false }));
  };

  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    mobile: '',
    age: 30,
    gender: 'MALE',
    height: 170.0,
    weight: 70.0,
    targetWeight: 65.0,
    activityLevel: 'SEDENTARY',
    goal: 'MAINTAIN',
    diet: 'NON_VEGETARIAN'
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/profile');
      setProfile(res.data);
      setFormData({
        name: res.data.name || '',
        avatar: res.data.avatar || '',
        mobile: res.data.mobile || '',
        age: res.data.age || 30,
        gender: res.data.gender || 'MALE',
        height: res.data.height || 170.0,
        weight: res.data.weight || 70.0,
        targetWeight: res.data.targetWeight || 65.0,
        activityLevel: res.data.activityLevel || 'SEDENTARY',
        goal: res.data.goal || 'MAINTAIN',
        diet: res.data.diet || 'NON_VEGETARIAN'
      });
    } catch (err) {
      console.error(err);
      showPopUp('Profile Fetch Error', 'Could not retrieve profile metrics from database.', 'error');
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showPopUp('File Too Large', 'Please select an image file under 5MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        setFormData(prev => ({ ...prev, avatar: base64Image }));

        try {
          const res = await api.put('/api/profile', { ...formData, avatar: base64Image });
          setProfile(res.data);
          
          // Update local storage user profile with avatar
          const localUser = JSON.parse(localStorage.getItem('user') || '{}');
          localUser.avatar = base64Image;
          localUser.name = res.data.name;
          localStorage.setItem('user', JSON.stringify(localUser));

          // Notify all components across dashboard
          window.dispatchEvent(new Event('storage'));

          showPopUp('Profile Picture Updated!', 'Your new profile picture has been saved successfully.', 'success');
        } catch (err) {
          console.error(err);
          showPopUp('Upload Failed', 'Could not save profile picture. Please try again.', 'error');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // CREATE / UPDATE Profile CRUD operation
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put('/api/profile', formData);
      setProfile(res.data);
      
      // Update local storage user name & avatar
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = res.data.name;
      user.avatar = res.data.avatar;
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));

      // Trigger Pop Up message with OK button
      showPopUp(
        'Profile Updated Successfully!',
        `Your profile details have been saved. Your recalculated BMI is ${res.data.bmi || 'N/A'}, BMR is ${res.data.bmr || 'N/A'} kcal, and Daily Target is ${res.data.dailyCalories || 'N/A'} kcal.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showPopUp('Profile Update Failed', 'An error occurred while saving profile changes. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // DELETE / RESET Profile CRUD operation
  const handleResetProfile = async () => {
    setResetting(true);
    const defaultData = {
      name: JSON.parse(localStorage.getItem('user') || '{}').name || 'User',
      avatar: '',
      mobile: '',
      age: 30,
      gender: 'MALE',
      height: 170.0,
      weight: 70.0,
      targetWeight: 65.0,
      activityLevel: 'SEDENTARY',
      goal: 'MAINTAIN',
      diet: 'NON_VEGETARIAN'
    };

    try {
      const res = await api.put('/api/profile', defaultData);
      setProfile(res.data);
      setFormData(defaultData);

      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      localUser.avatar = '';
      localStorage.setItem('user', JSON.stringify(localUser));
      window.dispatchEvent(new Event('storage'));

      // Trigger Pop Up message with OK button
      showPopUp(
        'Profile Reset Successfully!',
        'Your profile body parameters and nutritional targets have been reset to default values.',
        'delete'
      );
    } catch (err) {
      console.error(err);
      showPopUp('Reset Failed', 'Could not reset profile metrics. Please try again.', 'error');
    } finally {
      setResetting(false);
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
      {/* Pop Up Modal with OK Button */}
      <PopUpModal
        open={popUp.open}
        title={popUp.title}
        body={popUp.body}
        type={popUp.type}
        onOk={closePopUp}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">User Profile</h2>
          <p className="text-slate-500 text-sm font-semibold">Configure body metrics and track daily health calculations.</p>
        </div>

        <button
          onClick={handleResetProfile}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-extrabold text-xs rounded-xl shadow-xs transition duration-200 active:scale-95 cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>{resetting ? 'Resetting...' : 'Reset Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric breakdown cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-200/60 text-center shadow-md">
            {/* Profile Avatar with Camera Button */}
            <div className="relative group w-24 h-24 mx-auto mb-4">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={formData.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF9E8A] to-[#B56A45] flex items-center justify-center font-black text-white text-3xl uppercase shadow-sm">
                  {formData.name ? formData.name[0] : 'U'}
                </div>
              )}
              <label
                className="absolute bottom-0 right-0 p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
                title="Upload Profile Picture"
              >
                <Camera size={15} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <h3 className="font-extrabold text-lg text-slate-800">{formData.name || 'User'}</h3>
            <p className="text-xs text-slate-500 font-bold mt-0.5">{profile?.user?.email}</p>

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">BMI</span>
                <span className="font-extrabold text-slate-800">{profile?.bmi || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">BMR (Mifflin)</span>
                <span className="font-extrabold text-slate-800">{profile?.bmr || 'N/A'} kcal</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">TDEE (Daily Burn)</span>
                <span className="font-extrabold text-slate-800">{profile?.tdee || 'N/A'} kcal</span>
              </div>
            </div>
          </div>

          {/* Daily Goals Summary */}
          <div className="glass p-6 rounded-3xl border border-slate-200/60 space-y-4 shadow-md">
            <h4 className="font-extrabold text-sm text-slate-800">Daily Target Targets</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Calories</p>
                <p className="text-base font-extrabold text-emerald-800 mt-1">{profile?.dailyCalories || 'N/A'} kcal</p>
              </div>
              <div className="bg-teal-50/60 p-3 rounded-2xl border border-teal-100">
                <p className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">Protein</p>
                <p className="text-base font-extrabold text-teal-800 mt-1">{profile?.dailyProtein || 'N/A'} g</p>
              </div>
              <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100">
                <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Carbohydrates</p>
                <p className="text-base font-extrabold text-blue-800 mt-1">{profile?.dailyCarbs || 'N/A'} g</p>
              </div>
              <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100">
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Fats</p>
                <p className="text-base font-extrabold text-amber-800 mt-1">{profile?.dailyFat || 'N/A'} g</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-slate-200/60 shadow-md">
          <h3 className="font-extrabold text-base mb-6 text-slate-800">Modify Body Profile</h3>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Mobile Phone</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Target Weight (kg)</label>
                <input
                  type="number"
                  name="targetWeight"
                  value={formData.targetWeight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Physical Activity Level</label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="SEDENTARY">Sedentary (Little/no exercise)</option>
                <option value="LIGHTLY_ACTIVE">Lightly Active (1-3 days/wk)</option>
                <option value="MODERATELY_ACTIVE">Moderately Active (3-5 days/wk)</option>
                <option value="VERY_ACTIVE">Very Active (6-7 days/wk)</option>
                <option value="EXTRA_ACTIVE">Extra Active (Gym twice/day)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Primary Goal</label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="LOSE_WEIGHT">Lose Weight (-500 kcal deficit)</option>
                <option value="MAINTAIN">Maintain Weight</option>
                <option value="GAIN_MUSCLE">Gain Muscle (+350 kcal surplus)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Dietary Preference</label>
              <select
                name="diet"
                value={formData.diet}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                <option value="VEGETARIAN">Vegetarian</option>
              </select>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl shadow-card transition duration-200 active:scale-95 cursor-pointer"
              >
                {saving ? 'Calculating Metrics...' : 'Update & Recalculate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
