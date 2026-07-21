import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Activity, Apple, ChevronRight, Leaf, Droplet, User, Check, Plus, MessageSquare, AlertCircle } from 'lucide-react';

interface PreviewParticle {
  id: number;
  x: number;
  y: number;
  dx: string;
  dy: string;
}

const LandingPage: React.FC = () => {
  // Sandbox Habit States
  const [glasses, setGlasses] = useState(3);
  const [isSwelling, setIsSwelling] = useState(false);
  const [particles, setParticles] = useState<PreviewParticle[]>([]);
  
  // Sandbox AI Coach States
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: "Hey! I'm Ria, your AI Coach. Ready to build healthy habits today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Quick Chat click handler
  const handleAskRia = (question: string, answer: string) => {
    if (isTyping) return;
    setChatLog(prev => [...prev, { sender: 'user', text: question }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatLog(prev => [...prev, { sender: 'bot', text: answer }]);
    }, 900);
  };

  // Quick Water log handler
  const handleAddGlassPreview = () => {
    setIsSwelling(true);
    setTimeout(() => setIsSwelling(false), 500);

    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: 56 + (Math.random() - 0.5) * 20,
      y: 40 + (Math.random() - 0.5) * 10,
      dx: `${(Math.random() - 0.5) * 60}px`,
      dy: `${-Math.random() * 40 - 20}px`,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 700);

    setGlasses(prev => (prev >= 8 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FFFDF9] via-[#FFF1E6] to-[#FFE3D4] text-slate-800 flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="glow-spot-green top-[-10%] left-[-10%] opacity-40"></div>
      <div className="glow-spot-orange bottom-[20%] right-[-10%] opacity-40"></div>

      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 border-b border-white/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-200 text-primary-655 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Leaf className="stroke-[2.5]" size={20} />
          </div>
          <span className="font-extrabold text-xl bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            NutriTrack Pro
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold transition duration-200">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-card transition duration-200 active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section Container */}
      <section className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center px-6 py-16 z-10 relative">
        
        {/* Left Info Column */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-[#FFDCD0] text-xs text-primary-700 font-extrabold mb-2">
            <Sparkles size={14} className="text-[#FF9E8A] animate-pulse" />
            <span>Interactive Habit & Nutrition Tracker</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-800">
            Master your health <br className="hidden md:inline" />
            with <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-[#B56A45] bg-clip-text text-transparent">
              H2O Harmony
            </span>
          </h1>

          <p className="text-slate-600 text-lg leading-relaxed font-bold max-w-xl mx-auto lg:mx-0">
            Build lasting habits. Chat with Ria your AI coach, log meals with custom macro rings, and view goal cycles that reward you for staying strong.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <Link 
              to="/register" 
              className="flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-2xl shadow-card transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
            >
              <span>Start Tracking Free</span>
              <ChevronRight size={18} />
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 bg-white/40 hover:bg-white/60 border border-[#FFDCD0] text-[#B56A45] font-extrabold rounded-2xl transition duration-200 active:scale-95 shadow-sm"
            >
              Demo Sign In
            </Link>
          </div>
        </div>

        {/* Right Sandbox Preview Column */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm bg-white/40 border border-white/65 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-md space-y-6">
            
            <div className="flex justify-between items-center pb-3 border-b border-[#FFDCD0]/70">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Sandbox Demo</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500">Interactive Preview</span>
            </div>

            {/* Part 1: Interactive Water Ring Preview */}
            <div className="bg-white/50 border border-white/50 rounded-3xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                
                {/* Micro Gauge Circle */}
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="24" className="stroke-[#EBF7F8] fill-none" strokeWidth="6" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="24" 
                      className="stroke-[#81B5CA] fill-none transition-all duration-500" 
                      strokeWidth={isSwelling ? "8" : "6"} 
                      strokeDasharray={2 * Math.PI * 24}
                      strokeDashoffset={2 * Math.PI * 24 * (1 - Math.min(8, glasses) / 8)}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Inside metrics */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-black text-slate-800">{glasses} / 8</span>
                  </div>

                  {/* Splash Particle Overlay */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {particles.map(p => (
                      <span
                        key={p.id}
                        className="absolute w-1.5 h-1.5 bg-[#81B5CA] rounded-full animate-particle"
                        style={{
                          left: `${p.x}px`,
                          top: `${p.y}px`,
                          '--dx': p.dx,
                          '--dy': p.dy,
                        } as React.CSSProperties}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-slate-800">Hydration Streak</h4>
                  <p className="text-[10px] text-slate-500 font-bold">Goal Cycle: 8 Glasses</p>
                </div>
              </div>

              <button
                onClick={handleAddGlassPreview}
                className="p-2 bg-[#FFF0EB] border border-[#FFDCD0] rounded-xl text-[#B56A45] hover:bg-[#FFE3D4] active:scale-90 transition-all duration-200"
                title="Log a glass of water"
              >
                <Plus size={16} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Part 2: Interactive Ria AI Chat Preview */}
            <div className="bg-white/50 border border-white/50 rounded-3xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-primary-500" size={16} />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-550">Chat with Ria</span>
              </div>

              {/* Message Log */}
              <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1 text-[11px]">
                {chatLog.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex gap-2 items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[9px] font-bold text-primary-600 flex-shrink-0">R</div>
                    )}
                    <div className={`p-2 rounded-xl max-w-[80%] font-semibold leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-2 items-center">
                    <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[9px] font-bold text-primary-655 flex-shrink-0">R</div>
                    <span className="text-[9px] text-slate-400 font-bold animate-pulse">Ria is typing...</span>
                  </div>
                )}
              </div>

              {/* Sugggestion Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { q: "Healthy snack suggestion?", a: "Greek yogurt topped with berries and organic honey! 🍓 It's rich in gut-healthy protein." },
                  { q: "Workout energy boost?", a: "Eat a ripe banana 15 minutes before your workout! Potassium supports fast muscle recovery." }
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskRia(s.q, s.a)}
                    className="text-[9px] bg-white border border-[#FFDCD0] px-2.5 py-1 rounded-full text-[#B56A45] hover:bg-[#FFF0EB] font-bold active:scale-95 transition-all"
                  >
                    {s.q}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link 
                to="/register" 
                className="text-[10px] text-primary-600 hover:underline font-extrabold uppercase tracking-widest"
              >
                Sign up to unlock all trackers & AI features &rarr;
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* Feature Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-3xl border border-white/50 hover:border-primary-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600 mb-6 shadow-sm">
              <Apple size={24} />
            </div>
            <h3 className="font-extrabold text-lg mb-2 text-slate-800">Smart Log Meal</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              Search ingredient nutrients or scan product barcodes to track macro progress rings and logs.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/50 hover:border-primary-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600 mb-6 shadow-sm">
              <Sparkles size={24} />
            </div>
            <h3 className="font-extrabold text-lg mb-2 text-slate-800">Ria AI Coach</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              Receive personalized fitness goals, healthy recipes, and answers regarding food calories dynamically.
            </p>
            <p className="text-[10px] text-amber-800 font-bold mt-3 pt-2 border-t border-slate-200/60 flex items-start gap-1.5">
              <AlertCircle size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <span>Ria provides general wellness tips and is not substitute for professional medical advice, diagnosis or treatment.</span>
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/50 hover:border-primary-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600 mb-6 shadow-sm">
              <Activity size={24} />
            </div>
            <h3 className="font-extrabold text-lg mb-2 text-slate-800">Streaks & Rewards</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              Achieve streak progress to earn rewards and track hydration cycles with micro-animations.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-white/40 text-center py-6 px-4 text-xs text-slate-600 mt-12 z-10 space-y-1">
        <p>&copy; {new Date().getFullYear()} NutriTrack Pro. All rights reserved. Enterprise health assistant.</p>
        <p className="text-[11px] text-slate-600 font-bold max-w-3xl mx-auto pt-1">
          <span className="font-extrabold text-amber-800">Medical Disclaimer:</span> Ria provides general wellness tips and is not substitute for professional medical advice, diagnosis or treatment.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
