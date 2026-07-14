import React, { useState, useEffect } from 'react';
import { Droplet, Minus, GlassWater, HelpCircle } from 'lucide-react';
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

          <h3 className="font-extrabold text-base mb-8 text-slate-300">Daily Hydration Goal</h3>

          <div className="grid grid-cols-4 md:grid-cols-5 gap-4 mb-6">
            {Array.from({ length: Math.ceil(waterGoal / 250) }).map((_, idx) => {
              const isFilled = amountMl >= (idx + 1) * 250;
              return (
                <button
                  key={idx}
                  onClick={() => handleUpdateWater(isFilled ? -250 : 250)}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${
                    isFilled 
                      ? 'bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-blue-400 border border-blue-500/50 scale-105' 
                      : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:bg-slate-800 hover:text-slate-400'
                  }`}
                >
                  <GlassWater size={28} className={isFilled ? 'fill-blue-500/20' : ''} />
                  <span className="text-[10px] font-bold mt-1">250ml</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-blue-400">{amountMl} ml</p>
            <p className="text-xs text-slate-500 font-semibold">Remaining: {remaining} ml / Goal: {waterGoal} ml</p>
          </div>
        </div>

        {/* Logging Actions */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="font-extrabold text-base text-slate-300">Quick Log Custom Amount</h3>

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
