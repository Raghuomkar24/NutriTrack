import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Activity, Apple, ChevronRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF1E6] to-[#F4F3EE] text-slate-800 flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="glow-spot-green top-[-10%] left-[-10%] opacity-40"></div>
      <div className="glow-spot-orange bottom-[20%] right-[-10%] opacity-40"></div>

      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 border-b border-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🥑</span>
          <span className="font-extrabold text-xl bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            NutriTrack Pro
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold transition duration-200">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow-card transition duration-200 active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto z-10 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-slate-300 text-xs text-primary-600 font-bold mb-6 animate-pulse">
          <Sparkles size={14} />
          <span>Now Powered by OpenAI GPT-4o</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-800">
          Optimize Your Health With <br />
          <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-[#B56A45] bg-clip-text text-transparent">
            AI-Powered Nutrition
          </span>
        </h1>

        <p className="text-slate-600 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-medium">
          Log meals, track metrics, scan barcodes, and get automated grocery lists. Chat with your custom AI nutrition coach to achieve weight goals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link 
            to="/register" 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-card transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
          >
            <span>Create Free Account</span>
            <ChevronRight size={18} />
          </Link>
          <Link 
            to="/login" 
            className="px-8 py-4 glass hover:bg-white/70 border border-slate-300 font-bold rounded-2xl transition duration-200 active:scale-95 text-slate-700"
          >
            Demo Sign In
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="glass p-8 rounded-3xl border border-white/50 hover:border-primary-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-600 mb-6">
              <Apple size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">Smart Food Tracker</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              Instantly search ingredients or scan product barcodes to compile calorie logs and breakdown vitamins.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/50 hover:border-primary-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-600 mb-6">
              <Sparkles size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">AI Nutrition Coach</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              Get personalized macro plans, recipe suggestions, and real-time food photo breakdown with our OpenAI assistant.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/50 hover:border-primary-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-600 mb-6">
              <Activity size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">Health Analytics</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              Visualize weight tracking, hydration charts, and exercise metrics. Export printable PDF nutrition scorecards.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-slate-350 text-center py-6 text-xs text-slate-600 mt-20 z-10">
        <p>&copy; {new Date().getFullYear()} NutriTrack Pro. All rights reserved. Enterprise-grade health tracker.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
