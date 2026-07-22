import React, { useState, useEffect } from 'react';
import { Droplet, Trophy, Crown, Gift, HelpCircle, Sparkles, Check, Menu, Activity, Heart, ShoppingCart, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/api';
import { useAlert } from '@/context/AlertContext';

// Confetti particle component for completion celebration
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

const CONFETTI_COLORS = ['#FFE3D4', '#FFF1E6', '#FF9E8A', '#B56A45', '#F4F3EE'];

interface SplashParticle {
  id: number;
  x: number;
  y: number;
  dx: string;
  dy: string;
  color: string;
}

interface CompletionSparkle {
  id: number;
  dx: string;
  dy: string;
  rot: string;
  color: string;
}

const WaterTracker: React.FC = () => {
  const [amountMl, setAmountMl] = useState(0);
  const [loading, setLoading] = useState(true);
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [customInput, setCustomInput] = useState('');

  // H2O Harmony Animations & Particle States
  const [particles, setParticles] = useState<SplashParticle[]>([]);
  const [sparkles, setSparkles] = useState<CompletionSparkle[]>([]);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isSwelling, setIsSwelling] = useState(false);
  const [isTextScaling, setIsTextScaling] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [modalStage, setModalStage] = useState<'gift' | 'claim' | 'claimed'>('gift');
  const [confetti, setConfetti] = useState<{ x: number; y: number; color: string; delay: number }[]>([]);
  
  // Dynamic Glass Goal Slider state
  const [glassesGoal, setGlassesGoal] = useState(8);

  const { showAlert, confirmDelete } = useAlert();

  // CRUD confirmation — handled by global ConfirmDialog via useAlert

  const fetchWaterLog = async () => {
    try {
      const res = await api.get(`/api/water?date=${date}`);
      setAmountMl(res.data.amountMl);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterLog();
  }, []);

  // Compute glasses based on backend ml (1 glass = 250ml)
  const glasses = Math.round(amountMl / 250);
  const percent = Math.min(100, (glasses / glassesGoal) * 100);

  // Trigger H2O Harmony add sequence
  const handleAddGlass = async (incrementMl: number, isBottle: boolean = false) => {
    const targetGlasses = isBottle ? 2 : 1;
    const currentGlasses = Math.round(amountMl / 250);
    const newGlasses = currentGlasses + targetGlasses;
    const isFinalLog = currentGlasses < glassesGoal && newGlasses >= glassesGoal;

    // Trigger ring pulse & swell states
    setIsPulsing(true);
    setIsSwelling(true);
    setIsTextScaling(true);
    setTimeout(() => {
      setIsPulsing(false);
      setIsSwelling(false);
      setIsTextScaling(false);
    }, 600);

    // Generate fluid splash particles above the text center
    const splashColors = ['#A2D2DF', '#81B5CA', '#FFF0EB', '#FFE3D4'];
    const newParticles = Array.from({ length: 7 }, (_, i) => ({
      id: Date.now() + i,
      x: 144 + (Math.random() - 0.5) * 50,
      y: 120 + (Math.random() - 0.5) * 15,
      dx: `${(Math.random() - 0.5) * 100}px`,
      dy: `${-Math.random() * 60 - 25}px`,
      color: splashColors[i % splashColors.length],
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 750);

    // Goal Completed Sequence (glassesGoal reached)
    if (isFinalLog) {
      // Powerful pink & blue sparkle radial explosion
      const newSparkles = Array.from({ length: 40 }, (_, i) => {
        const angle = (i / 40) * 2 * Math.PI;
        const velocity = 85 + Math.random() * 95;
        return {
          id: Date.now() + i,
          dx: `${Math.cos(angle) * velocity}px`,
          dy: `${Math.sin(angle) * velocity}px`,
          rot: `${(Math.random() - 0.5) * 360}deg`,
          color: i % 2 === 0 ? '#FFE3D4' : '#A2D2DF',
        };
      });
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 1200);

      // Drops in the achievement modal after sparkles bloom
      setTimeout(() => {
        setModalStage('gift');
        setShowRewardModal(true);
      }, 1000);
    }

    try {
      const targetMl = Math.max(0, amountMl + incrementMl);
      const res = await api.post('/api/water', { date, amountMl: targetMl });
      setAmountMl(res.data.amountMl);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customInput);
    if (isNaN(parsed) || parsed <= 0) return;
    await handleAddGlass(parsed, parsed >= 500);
    setCustomInput('');
  };

  const handleResetTracker = async () => {
    const ok = await confirmDelete({
      title: 'Reset Hydration?',
      body: "This will permanently clear today's logged water intake.",
    });
    if (!ok) return;
    try {
      const res = await api.post('/api/water', { date, amountMl: 0 });
      setAmountMl(res.data.amountMl);
      setShowRewardModal(false);
      setModalStage('gift');
      showAlert({ type: 'delete', title: 'Data Removed', body: 'The log has been permanently cleared.' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLog = async (idx: number) => {
    const ok = await confirmDelete({
      title: 'Remove Log Entry?',
      body: 'This action cannot be undone. Are you sure?',
    });
    if (!ok) return;
    const isBottle = idx % 3 === 2;
    const decrementMl = isBottle ? 500 : 250;
    const newAmount = Math.max(0, amountMl - decrementMl);
    try {
      const res = await api.post('/api/water', { date, amountMl: newAmount });
      setAmountMl(res.data.amountMl);
      showAlert({ type: 'delete', title: 'Data Removed', body: 'The log has been permanently cleared.' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimReward = () => {
    setModalStage('claimed');
    // Confetti drop
    const newConfetti = Array.from({ length: 120 }, (_, i) => ({
      x: window.innerWidth * 0.2 + Math.random() * window.innerWidth * 0.6,
      y: -50 - Math.random() * 250,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 1500,
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 4500);
  };

  // Dynamic progress ring color stops based on glasses progress
  const getGradientColors = () => {
    const ratio = Math.min(glassesGoal, glasses) / glassesGoal;
    
    // Aqua-Teal Start (#A2D2DF) -> Green Start (#B8E1D4)
    const rStart = Math.round(162 + (184 - 162) * ratio);
    const gStart = Math.round(210 + (225 - 210) * ratio);
    const bStart = Math.round(223 + (212 - 223) * ratio);

    // Aqua-Teal End (#81B5CA) -> Green End (#85C7B7)
    const rEnd = Math.round(129 + (133 - 129) * ratio);
    const gEnd = Math.round(181 + (199 - 181) * ratio);
    const bEnd = Math.round(202 + (183 - 202) * ratio);

    return {
      start: `rgb(${rStart}, ${gStart}, ${bStart})`,
      end: `rgb(${rEnd}, ${gEnd}, ${bEnd})`
    };
  };

  const gradColors = getGradientColors();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs">Loading Harmony tracker...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-12">
      {/* Centered Water Tracker Card Container */}
      <div className="glass p-8 rounded-3xl border border-white/50 bg-white/20 shadow-2xl relative overflow-hidden flex flex-col items-center space-y-6">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center pb-2 border-b border-[#FFDCD0]/60">
          <div className="text-left">
            <h3 className="font-extrabold text-lg text-slate-800">Water Intake</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">H2O Harmony Cycle</p>
          </div>
          <Droplet className="text-[#81B5CA] animate-pulse" size={24} />
        </div>

        {/* Large circular progress gauge */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          
          {/* Sparkles Explosion Overlay */}
          {sparkles.length > 0 && (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              {sparkles.map(s => (
                <span
                  key={s.id}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full animate-sparkle"
                  style={{
                    backgroundColor: s.color,
                    '--dx': s.dx,
                    '--dy': s.dy,
                    '--rot': s.rot,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}

          <div className="absolute inset-0 transition-all duration-300">
            <svg className="w-72 h-72 transform -rotate-90">
              <defs>
                <linearGradient id="harmonyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={gradColors.start} />
                  <stop offset="100%" stopColor={gradColors.end} />
                </linearGradient>
              </defs>
              {/* Background empty light ring */}
              <circle
                cx="144"
                cy="144"
                r="112"
                className="stroke-[#EBF7F8]/45 fill-none"
                strokeWidth="10"
              />
              {/* Animated swelling progress ring */}
              <circle
                cx="144"
                cy="144"
                r="112"
                className="stroke-[url(#harmonyGrad)] fill-none transition-all duration-700 ease-out"
                strokeWidth={isSwelling ? "15" : "10"}
                strokeDasharray={2 * Math.PI * 112}
                strokeDashoffset={2 * Math.PI * 112 * (1 - Math.min(glassesGoal, glasses) / glassesGoal)}
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Foreground 3D Photorealistic Water Glass */}
          <div className={`relative w-[114px] h-[178px] flex flex-col justify-end items-center transition-all duration-300 ${
            isSwelling ? 'scale-105' : 'scale-100'
          }`}>
            
            {/* Glass Rim Top Lip Shadow */}
            <div className="absolute top-0 inset-x-0 h-4 bg-white/20 border-b border-white/30 rounded-t-full z-20 pointer-events-none" />

            {/* The Glass Container Cylinder Body */}
            <div 
              className="w-full h-full rounded-b-[2rem] rounded-t-[0.6rem] border-2 border-white/60 bg-white/12 backdrop-blur-[1px] overflow-hidden flex flex-col justify-end relative shadow-[0_15px_30px_rgba(129,181,202,0.18)]"
              style={{
                boxShadow: 'inset 0 4px 6px rgba(255, 255, 255, 0.4), inset -4px 0 10px rgba(255,255,255,0.2), inset 4px 0 10px rgba(0,0,0,0.05)'
              }}
            >
              {/* Inner Liquid Level */}
              <div 
                className="w-full relative transition-all duration-1000 ease-out flex flex-col justify-end"
                style={{ 
                  height: `${percent}%`,
                  background: `linear-gradient(0deg, ${gradColors.end} 0%, ${gradColors.start} 100%)`
                }}
              >
                {/* Wave effect at top of water */}
                {percent > 0 && percent < 100 && (
                  <div className="absolute -top-1.5 inset-x-0 h-3 bg-white/40 rounded-full filter blur-xs animate-water-wave opacity-80" />
                )}

                {/* Rising Bubbles inside liquid */}
                {percent > 0 && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
                    <span className="absolute bottom-4 left-6 w-1.5 h-1.5 bg-white/35 rounded-full animate-bubble-up-1" />
                    <span className="absolute bottom-12 right-8 w-1 h-1 bg-white/45 rounded-full animate-bubble-up-2" />
                    <span className="absolute bottom-20 left-12 w-2.5 h-2.5 bg-white/20 rounded-full animate-bubble-up-3" />
                  </div>
                )}
              </div>

              {/* Vertical glare refraction lines */}
              <div className="absolute inset-y-0 left-3 w-3 bg-gradient-to-r from-white/25 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-y-0 right-3.5 w-1.5 bg-gradient-to-l from-white/20 to-transparent pointer-events-none z-10" />
              
              {/* Thick Glass Bottom Base */}
              <div className="absolute bottom-0 inset-x-0 h-5 bg-white/25 border-t border-white/10 z-10" />
            </div>
          </div>

          {/* Inner dynamic content centered on top of the glass */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-25 pointer-events-none">
            {glasses >= glassesGoal ? (
              /* Streak Medal Morph state */
              <div className="animate-badge-morph flex flex-col items-center">
                <Crown size={28} className="text-[#F4C542] fill-[#F4C542] drop-shadow-sm -mb-1 animate-bounce" style={{ animationDuration: '3.3s' }} />
                <div className="w-20 h-20 rounded-full bg-[#FFF0EB] border border-[#FFDCD0] flex items-center justify-center shadow-lg shadow-[#FF9E8A]/15">
                  <Trophy size={36} className="text-[#FF9E8A] fill-[#FF9E8A]/15" />
                </div>
                <span className="text-[#B56A45] font-black text-sm mt-2">Streak 7</span>
                <span className="text-[10px] text-slate-555 font-bold uppercase tracking-wider">Goal Achieved!</span>
              </div>
            ) : (
              /* Standard dynamic tracker text state overlaid on the glass (as in image_0.png) */
              <div className="flex flex-col items-center mt-6">
                <p className="text-slate-800 text-xs font-black uppercase tracking-wider opacity-90">Log Water</p>
                <p className={`text-2xl font-black tracking-tight text-slate-800 transition-transform duration-300 mt-0.5 ${
                  isTextScaling ? 'scale-110' : 'scale-100'
                }`}>
                  {glasses} <span className="text-xs font-bold text-slate-500">/ {glassesGoal} glasses</span>
                </p>
              </div>
            )}

            {/* Splash Particles Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {particles.map(p => (
                <span
                  key={p.id}
                  className="absolute w-2 h-2 rounded-full animate-particle"
                  style={{
                    left: `${p.x}px`,
                    top: `${p.y}px`,
                    backgroundColor: p.color,
                    '--dx': p.dx,
                    '--dy': p.dy,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Goal Slider inside Card */}
        <div className="w-full space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-xs font-black text-slate-700">
            <span>Daily Goal</span>
            <span className="text-[#B56A45] font-black">{glassesGoal} Glasses</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="12" 
            value={glassesGoal} 
            onChange={(e) => setGlassesGoal(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all shadow-inner"
            style={{
              background: `linear-gradient(to right, #B56A45 0%, #B56A45 ${((glassesGoal - 1) / 11) * 100}%, rgba(0, 0, 0, 0.08) ${((glassesGoal - 1) / 11) * 100}%, rgba(0, 0, 0, 0.08) 100%)`
            }}
          />
        </div>

        {/* Quick Buttons below Circle */}
        <div className="flex gap-4 w-full justify-center">
          <button
            onClick={() => handleAddGlass(250, false)}
            className="flex-1 py-3 bg-[#FFE3D4]/60 hover:bg-[#FFE3D4]/80 border border-[#FFDCD0] text-[#B56A45] font-extrabold text-xs rounded-2xl shadow-sm active:scale-95 transition-all duration-200"
          >
            Add +1 Glass
          </button>
          <button
            onClick={() => handleAddGlass(500, true)}
            className="flex-1 py-3 bg-[#E5F1F4]/75 hover:bg-[#E5F1F4]/95 border border-[#C5E1E6] text-[#2C7DA0] font-extrabold text-xs rounded-2xl shadow-sm active:scale-95 transition-all duration-200"
          >
            Add +1 Bottle
          </button>
        </div>

        {/* Custom ml Logger Form */}
        <form onSubmit={handleCustomSubmit} className="w-full pt-1">
          <div className="flex gap-2">
            <input
              type="number"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-[#FFDCD0]/60 bg-white/30 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#B56A45]/70"
              placeholder="Custom ml (e.g. 350)"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#81B5CA] hover:bg-[#6fa0b5] text-white font-extrabold text-xs rounded-xl active:scale-95 transition-all shadow-sm"
            >
              Log ml
            </button>
          </div>
        </form>

        {/* Today's Logs History */}
        <div className="w-full space-y-2.5 pt-2 border-t border-[#FFDCD0]/60">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider text-left">Today's Logs</h4>
          {glasses === 0 ? (
            <p className="text-[11px] text-slate-500 font-semibold py-4 text-center bg-white/10 rounded-2xl border border-dashed border-slate-300/40">
              No water logged for today.
            </p>
          ) : (
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {Array.from({ length: glasses }).map((_, idx) => {
                const mockTimes = ["7:30 AM", "9:15 AM", "11:00 AM", "1:30 PM", "3:45 PM", "5:20 PM", "7:00 PM", "8:30 PM", "10:00 PM", "11:15 PM"];
                const isBottle = idx % 3 === 2;
                return (
                  <div key={idx} className="flex justify-between items-center bg-white/40 border border-white/60 p-2.5 rounded-xl shadow-xs text-[11px] font-bold text-slate-700">
                    <span className="bg-[#FFF0EB] text-[#B56A45] px-2 py-0.5 rounded-md border border-[#FFDCD0] text-[9px]">
                      {mockTimes[idx % mockTimes.length]}
                    </span>
                    <span>{isBottle ? 'Bottle (500ml)' : 'Glass (250ml)'}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#81B5CA]">{isBottle ? '+500ml' : '+250ml'}</span>
                      <button
                        onClick={() => handleDeleteLog(idx)}
                        className="text-slate-400 hover:text-[#C96A52] text-sm font-black px-1"
                        title="Delete log"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hidden reset button to restart cycle demo */}
        <button
          onClick={handleResetTracker}
          className="text-[9px] text-slate-400 hover:text-slate-655 underline font-bold mt-2 tracking-wider transition-colors duration-200 uppercase pointer-events-auto"
        >
          Reset Harmony Tracker
        </button>

      </div>

      {/* Achievement Unlocked Drop-in Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          
          {/* Confetti particles */}
          {confetti.length > 0 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
              {confetti.map((p, i) => (
                <ConfettiParticle key={i} {...p} />
              ))}
            </div>
          )}

          <div className="w-full max-w-sm bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-2xl animate-elastic-drop flex flex-col items-center text-center space-y-4">
            
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#FF9E8A] bg-[#FFF0EB] px-3 py-1.5 rounded-full border border-[#FFDCD0]">
              <Sparkles size={12} className="animate-pulse" />
              <span>Streak Milestones</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-800">Goal Achieved!</h3>
              <p className="text-xs text-slate-550 font-bold">You’re 7 days strong!</p>
            </div>

            {/* Central Medal Badge representation */}
            <div className="relative my-4">
              <Crown size={32} className="text-[#F4C542] fill-[#F4C542] absolute -top-5.5 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDuration: '3s' }} />
              <div className="w-24 h-24 rounded-full bg-[#FFF0EB] border border-[#FFDCD0] flex items-center justify-center shadow-lg shadow-[#FF9E8A]/20">
                <Trophy size={44} className="text-[#FF9E8A] fill-[#FF9E8A]/15" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#FFF0EB] border border-[#FFDCD0] px-3 py-0.5 rounded-full text-[9px] font-extrabold text-[#B56A45]">
                Streak 7
              </div>
            </div>

            {/* Streak Progress bar details */}
            <div className="w-full space-y-2 pt-2">
              <div className="flex justify-between text-[11px] font-extrabold text-slate-500">
                <span>Streak Progress</span>
                <span>7/7 Days</span>
              </div>
              
              <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                  className="h-full bg-gradient-to-r from-[#A7D7C5] to-[#85C7B7] rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: modalStage === 'gift' ? '0%' : '100%' }}
                />
              </div>

              {/* Gift transitions into Claim Reward */}
              <div className="flex justify-center items-center h-14 pt-2">
                {modalStage === 'gift' && (
                  <div className="w-12 h-12 rounded-full bg-[#FFF0EB] border border-[#FFDCD0] flex items-center justify-center animate-bounce text-[#FF9E8A] shadow-md shadow-[#FF9E8A]/10">
                    <Gift size={22} className="animate-pulse" />
                  </div>
                )}
                {modalStage === 'claim' && (
                  <button
                    onClick={handleClaimReward}
                    className="w-full py-3 bg-[#85C7B7] hover:bg-[#6FAFA1] text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-[#85C7B7]/25 active:scale-95 transition-all duration-200 animate-fade-in"
                  >
                    CLAIM REWARD
                  </button>
                )}
                {modalStage === 'claimed' && (
                  <div className="w-full py-3 bg-[#E6F4EA] border border-[#A8DAB5] text-[#137333] font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 animate-pulse">
                    <Check size={16} />
                    <span>Reward Claimed! 🎁</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowRewardModal(false)}
              className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors font-bold uppercase tracking-wider mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default WaterTracker;
