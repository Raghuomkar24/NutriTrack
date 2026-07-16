import React, { useState, useEffect, useRef } from 'react';
import { Droplet, Minus, GlassWater, HelpCircle, Sparkles } from 'lucide-react';
import api from '../api';

// Confetti particle component
const ConfettiParticle: React.FC<{ x: number; y: number; color: string; delay: number }> = ({ x, y, color, delay }) => (
  <div
    className="confetti-particle"
    style={{
      left: x,
      top: y,
      backgroundColor: color,
      animationDelay: `${delay}ms`,
      width: Math.random() > 0.5 ? '6px' : '10px',
      height: Math.random() > 0.5 ? '6px' : '10px',
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    }}
  />
);

const CONFETTI_COLORS = ['#f97316', '#fb923c', '#fcd34d', '#10b981', '#34d399', '#60a5fa', '#a78bfa'];

const WaterTracker: React.FC = () => {
  const [amountMl, setAmountMl] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2500);
  const [loading, setLoading] = useState(true);
  const [customInput, setCustomInput] = useState('');
  const [date] = useState(new Date().toISOString().split('T')[0]);

  // Microinteraction state
  const [sloshing, setSloshing] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; y: number; color: string; delay: number }[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [btnSpring, setBtnSpring] = useState<string | null>(null);
  const prevAmountRef = useRef(amountMl);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Trigger slosh + celebration check when amount changes
  useEffect(() => {
    if (amountMl !== prevAmountRef.current && prevAmountRef.current !== 0) {
      // Trigger slosh
      setSloshing(true);
      setTimeout(() => setSloshing(false), 650);

      // Check for 100% goal
      const wasComplete = prevAmountRef.current >= waterGoal;
      const isNowComplete = amountMl >= waterGoal;
      if (!wasComplete && isNowComplete) {
        triggerCelebration();
      }
    }
    prevAmountRef.current = amountMl;
  }, [amountMl, waterGoal]);

  const triggerCelebration = () => {
    setShowCelebration(true);
    // Generate confetti
    const particles = Array.from({ length: 28 }, (_, i) => ({
      x: Math.random() * 300,
      y: Math.random() * 80,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 400,
    }));
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 1800);
  };

  const handleUpdateWater = async (increment: number, btnId?: string) => {
    const target = Math.max(0, amountMl + increment);

    // Spring animation on button
    if (btnId) {
      setBtnSpring(btnId);
      setTimeout(() => setBtnSpring(null), 380);
    }

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
  const isComplete = percent >= 100;

  // Progressive fill color based on stage
  const getFillColor = () => {
    if (isComplete) return 'linear-gradient(180deg, #f97316 0%, #fb923c 100%)'; // coral celebration
    if (percent >= 31)  return 'linear-gradient(180deg, #2563eb 0%, #0ea5e9 100%)'; // active blue
    return 'linear-gradient(180deg, #475569 0%, #334155 100%)';  // slate low
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">
          {isComplete ? (
            <span className="shimmer-text">Hydration Goal Complete! 🎉</span>
          ) : (
            'Water Tracker'
          )}
        </h2>
        <p className="text-slate-400 text-sm mt-1">Stay hydrated by tracking your water consumption daily.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Visual glass illustration — with microinteraction container */}
        <div
          ref={containerRef}
          className={`glass p-8 rounded-3xl border flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 ${
            isComplete
              ? 'glass-celebratory animate-base-pulse border-orange-500/40'
              : 'border-slate-800'
          }`}
        >
          {/* Confetti overlay */}
          {confetti.length > 0 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
              {confetti.map((p, i) => (
                <ConfettiParticle key={i} {...p} />
              ))}
            </div>
          )}

          {/* Celebration badge */}
          {isComplete && (
            <div className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-orange-400 animate-celebrate-in">
              <Sparkles size={14} className="animate-pulse" />
              <span>Goal Crushed!</span>
            </div>
          )}

          {!isComplete && (
            <div className="absolute top-4 right-4 text-blue-400 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide">
              <Droplet size={14} className="animate-bounce" />
              <span>Target Active</span>
            </div>
          )}

          <h3 className="font-extrabold text-base mb-8 text-slate-300">Daily Hydration Goal</h3>

          {/* Glass grid */}
          <div className="grid grid-cols-4 md:grid-cols-5 gap-4 mb-6">
            {Array.from({ length: Math.ceil(waterGoal / 250) }).map((_, idx) => {
              const isFilled = amountMl >= (idx + 1) * 250;
              return (
                <button
                  key={idx}
                  onClick={() => handleUpdateWater(isFilled ? -250 : 250, `glass-${idx}`)}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${
                    isFilled
                      ? isComplete
                        ? 'bg-orange-500/20 shadow-[0_0_18px_rgba(249,115,22,0.4)] text-orange-400 border border-orange-500/60 scale-105'
                        : 'bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-blue-400 border border-blue-500/50 scale-105'
                      : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:bg-slate-800 hover:text-slate-400'
                  } ${btnSpring === `glass-${idx}` ? 'animate-btn-spring' : ''}`}
                >
                  <GlassWater size={28} className={isFilled ? (isComplete ? 'fill-orange-500/20' : 'fill-blue-500/20') : ''} />
                  <span className="text-[10px] font-bold mt-1">250ml</span>
                </button>
              );
            })}
          </div>

          {/* Water fill bar with slosh */}
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${sloshing ? 'animate-water-slosh' : ''}`}
              style={{
                width: `${percent}%`,
                background: getFillColor(),
              }}
            />
          </div>

          <div className="space-y-1">
            <p
              className={`text-3xl font-extrabold transition-colors duration-500 ${
                isComplete ? 'text-orange-400' : 'text-blue-400'
              }`}
            >
              {amountMl} ml
            </p>
            <p className="text-xs text-slate-500 font-semibold">
              {isComplete ? '🎯 Daily goal achieved!' : `Remaining: ${remaining} ml / Goal: ${waterGoal} ml`}
            </p>
            {!isComplete && (
              <p className="text-xs text-slate-600">
                {Math.round(percent)}% of daily goal
              </p>
            )}
          </div>
        </div>

        {/* Logging Actions */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-800 space-y-5">
            <h3 className="font-extrabold text-base text-slate-300">Quick Add</h3>

            {/* Quick buttons */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '+250ml Glass', amount: 250, id: 'btn-250' },
                { label: '+500ml Bottle', amount: 500, id: 'btn-500' },
                { label: '+750ml Large', amount: 750, id: 'btn-750' },
                { label: '-250ml Undo', amount: -250, id: 'btn-minus' },
              ].map(({ label, amount, id }) => (
                <button
                  key={id}
                  onClick={() => handleUpdateWater(amount, id)}
                  className={`py-3 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    btnSpring === id ? 'animate-btn-spring' : ''
                  } ${
                    amount > 0
                      ? isComplete
                        ? 'bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400'
                        : 'bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400'
                      : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <form onSubmit={handleCustomSubmit} className="pt-4 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Log Custom Amount (ml)
              </label>
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
                  className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all duration-200 ${
                    isComplete
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Log Water
                </button>
              </div>
            </form>
          </div>

          {/* Tips / celebration panel */}
          {isComplete ? (
            <div className="glass-celebratory p-5 rounded-3xl flex gap-3 animate-celebrate-in">
              <Sparkles className="text-orange-400 flex-shrink-0 animate-pulse" size={20} />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-orange-300">Hydration Hero! 🏆</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  You've crushed your water goal for today! Staying hydrated boosts energy, improves focus, and accelerates recovery. Keep it up tomorrow!
                </p>
              </div>
            </div>
          ) : (
            <div className="glass p-5 rounded-3xl border border-slate-800/80 bg-slate-900/20 flex gap-3">
              <HelpCircle className="text-blue-400 flex-shrink-0" size={20} />
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-300">Why Hydration Matters</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Water increases energy level, improves physical stamina, aids in digestion, and speeds up weight loss by boosting metabolic rates.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
