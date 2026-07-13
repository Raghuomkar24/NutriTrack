import React, { useState, useEffect } from 'react';
import { Droplet, Plus, Minus, GlassWater, HelpCircle } from 'lucide-react';
import api from '../api';

const WaterTracker: React.FC = () => {
  const [amountMl, setAmountMl] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2500);
  const [loading, setLoading] = useState(true);
  const [customInput, setCustomInput] = useState('');
  const [date] = useState(new Date().toISOString().split('T')[0]);

  const fetchWaterLog = async () => {
    try {
      const res = await api.get(`/api/water?date=${date}`);
      setAmountMl(res.data.amountMl);
      
      const profileRes = await api.get('/api/profile');
      if (profileRes.data && profileRes.data.gender) {
        setWaterGoal(profileRes.data.gender === 'MALE' ? 3000 : 2200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterLog();
  }, []);

  const handleUpdateWater = async (increment: number) => {
    const target = Math.max(0, amountMl + increment);
    try {
      const res = await api.post('/api/water', { date, amountMl: target });
      setAmountMl(res.data.amountMl);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customInput);
    if (isNaN(parsed) || parsed <= 0) return;
    try {
      const res = await api.post('/api/water', { date, amountMl: parsed });
      setAmountMl(res.data.amountMl);
      setCustomInput('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs">Loading water logger...</p>
      </div>
    );
  }

  const remaining = Math.max(0, waterGoal - amountMl);
  const percent = Math.min(100, (amountMl / waterGoal) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Water Tracker</h2>
        <p className="text-slate-400 text-sm">Stay hydrated by tracking your water consumption daily.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Visual glass illustration */}
        <div className="glass p-8 rounded-3xl border border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-4 right-4 text-blue-400 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide">
            <Droplet size={14} className="animate-bounce" />
            <span>Target Active</span>
          </div>

          <h3 className="font-extrabold text-base mb-8 text-slate-300">Hydration Progress</h3>

          <div className="relative w-40 h-52 bg-slate-900/60 border-4 border-slate-700 rounded-b-[2rem] rounded-t-sm shadow-inner flex items-end justify-center overflow-hidden mb-6">
            {/* Water Wave Fill */}
            <div 
              className="w-full bg-blue-500/80 shadow-[0_0_15px_#3b82f6] transition-all duration-700 ease-out flex items-center justify-center font-bold text-sm text-white" 
              style={{ height: `${percent}%` }}
            >
              {percent > 15 && `${Math.round(percent)}%`}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-blue-400">{amountMl} ml</p>
            <p className="text-xs text-slate-500 font-semibold">Remaining: {remaining} ml / Goal: {waterGoal} ml</p>
          </div>
        </div>

        {/* Logging Actions */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="font-extrabold text-base text-slate-300">Quick Log Hydration</h3>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleUpdateWater(250)}
                className="p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-2xl flex flex-col items-center gap-2 text-blue-400 transition"
              >
                <GlassWater size={24} />
                <span className="text-xs font-bold">+250 ml</span>
              </button>

              <button
                onClick={() => handleUpdateWater(500)}
                className="p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-2xl flex flex-col items-center gap-2 text-blue-400 transition"
              >
                <GlassWater size={28} />
                <span className="text-xs font-bold">+500 ml</span>
              </button>

              <button
                onClick={() => handleUpdateWater(-250)}
                className="p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-2xl flex flex-col items-center gap-2 text-red-400 transition"
              >
                <Minus size={24} />
                <span className="text-xs font-bold">-250 ml</span>
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="pt-4 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Log Custom Amount (ml)</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  placeholder="e.g. 750, 1000"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 font-bold text-xs rounded-xl transition"
                >
                  Log Water
                </button>
              </div>
            </form>
          </div>

          {/* Tips panel */}
          <div className="glass p-5 rounded-3xl border border-slate-800/80 bg-slate-900/20 flex gap-3">
            <HelpCircle className="text-blue-400 flex-shrink-0" size={20} />
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-slate-300">Why Hydration Matters</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Water increases energy level, improves physical stamina, aids in digestion, and speeds up weight loss by boosting metabolic rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
