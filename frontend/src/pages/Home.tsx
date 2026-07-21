import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplet, Award, Plus, Trash2, Sparkles, ChevronRight, Utensils, Crown, HelpCircle,
  Calendar, TrendingUp, BarChart2, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  Tooltip, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import api from '../api';

// Animated Number Hook for dynamic counting
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(ease * value));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, [value]);
  return <>{displayValue}</>;
};

// Confetti particle
const ConfettiParticle: React.FC<{ x: number; y: number; color: string; delay: number }> = ({ x, y, color, delay }) => (
  <div
    className="confetti-particle"
    style={{
      left: x,
      top: y,
      backgroundColor: color,
      animationDelay: `${delay}ms`,
      width: Math.random() > 0.5 ? '7px' : '11px',
      height: Math.random() > 0.5 ? '7px' : '11px',
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    }}
  />
);

const CONFETTI_COLORS = ['#FFE3D4', '#FFF1E6', '#FF9E8A', '#B56A45', '#F4F3EE'];

const Home: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [aiReminder, setAiReminder] = useState<string | null>(null);

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    const handleStorage = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Historical summary state (Weekly / Monthly)
  const [summaryTimeframe, setSummaryTimeframe] = useState<7 | 30>(7);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [historicalLoading, setHistoricalLoading] = useState(false);

  const fetchHistoricalSummary = async (days: number, selectedDate: string) => {
    setHistoricalLoading(true);
    try {
      const selectedEnd = new Date(selectedDate);
      const hist = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(selectedEnd);
        d.setDate(selectedEnd.getDate() - i);
        const dStr = d.toISOString().split('T')[0];

        const [mealRes, waterRes, exerciseRes] = await Promise.all([
          api.get(`/api/meals?date=${dStr}`).catch(() => ({ data: [] })),
          api.get(`/api/water?date=${dStr}`).catch(() => ({ data: { amountMl: 0 } })),
          api.get(`/api/exercise?date=${dStr}`).catch(() => ({ data: [] }))
        ]);

        const cConsumed = (mealRes.data || []).reduce((sum: number, m: any) => sum + (m.totalCalories || 0), 0);
        const pConsumed = (mealRes.data || []).reduce((sum: number, m: any) => sum + (m.totalProtein || 0), 0);
        const cbConsumed = (mealRes.data || []).reduce((sum: number, m: any) => sum + (m.totalCarbs || 0), 0);
        const fConsumed = (mealRes.data || []).reduce((sum: number, m: any) => sum + (m.totalFat || 0), 0);
        const wMl = waterRes.data?.amountMl || 0;
        const eBurn = (exerciseRes.data || []).reduce((sum: number, e: any) => sum + (e.caloriesBurned || 0), 0);

        hist.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          consumed: Math.round(cConsumed),
          burned: Math.round(eBurn),
          protein: Math.round(pConsumed),
          carbs: Math.round(cbConsumed),
          fat: Math.round(fConsumed),
          water: wMl
        });
      }
      setHistoricalData(hist);
    } catch (err) {
      console.error("Error loading historical summary data", err);
    } finally {
      setHistoricalLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalSummary(summaryTimeframe, date);
  }, [summaryTimeframe, date]);
  
  // Localized confettis
  const [calorieConfetti, setCalorieConfetti] = useState<{ x: number; y: number; color: string; delay: number }[]>([]);
  const [waterConfetti, setWaterConfetti] = useState<{ x: number; y: number; color: string; delay: number }[]>([]);
  const [calorieCelebrated, setCalorieCelebrated] = useState(false);
  const [waterCelebrated, setWaterCelebrated] = useState(false);

  const [waterSloshing, setWaterSloshing] = useState(false);
  const [waterPulsing, setWaterPulsing] = useState(false);
  const [waterSwelling, setWaterSwelling] = useState(false);
  const [waterTextScaling, setWaterTextScaling] = useState(false);
  const [waterSplashParticles, setWaterSplashParticles] = useState<{ id: number; x: number; y: number; dx: string; dy: string; color: string }[]>([]);
  const prevCaloriePercent = useRef(0);
  const prevWaterMl = useRef(0);

  // New interactive tracker states
  const [sleepHours, setSleepHours] = useState(7.5);
  const sleepGoal = 8;
  const sleepPercent = Math.min(100, (sleepHours / sleepGoal) * 100);

  const [exercisesChecklist, setExercisesChecklist] = useState(() => {
    const saved = localStorage.getItem('completed-exercises-ids');
    const completedIds = saved ? JSON.parse(saved) : [];
    const base = [
      { id: 1, name: 'Early Morning Yoga', duration: '30 mins Daily', completed: false, category: 'Yoga' },
      { id: 2, name: 'Daily Steps Goal', duration: '6,200 steps', completed: false, category: 'Walk' },
      { id: 3, name: 'Strength Workout', duration: '45 mins Gym', completed: false, category: 'Gym' },
      { id: 4, name: 'Evening Walk', duration: '20 mins Walk', completed: false, category: 'Walk' },
    ];
    return base.map(item => completedIds.includes(item.id) ? { ...item, completed: true } : item);
  });

  const triggerCalorieConfetti = () => {
    setCalorieCelebrated(true);
    const particles = Array.from({ length: 32 }, (_, i) => ({
      x: Math.random() * 260,
      y: Math.random() * 180,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 400,
    }));
    setCalorieConfetti(particles);
    setTimeout(() => setCalorieConfetti([]), 1800);
  };

  const handleToggleChecklist = (id: number) => {
    setExercisesChecklist(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, completed: true } : e);
      const completedIds = updated.filter(e => e.completed).map(e => e.id);
      localStorage.setItem('completed-exercises-ids', JSON.stringify(completedIds));
      return updated;
    });
    // Trigger celebration confetti
    triggerCalorieConfetti();
  };

  const [deleteMealId, setDeleteMealId] = useState<number | null>(null);

  const handleThemeChange = (themeName: string) => {
    document.documentElement.classList.remove('theme-sunset', 'theme-ocean', 'theme-forest');
    document.documentElement.classList.add(`theme-${themeName}`);
    localStorage.setItem('theme-preference', themeName);
  };

  const fetchDashboardData = async () => {
    try {
      const summaryRes = await api.get(`/api/dashboard/summary?date=${date}`);
      setSummary(summaryRes.data);

      try {
        const reminderRes = await api.get('/api/ai/reminder');
        setAiReminder(reminderRes.data.reminder);
      } catch (err) {
        console.error("Error loading AI reminder", err);
      }
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [date]);

  // Confetti trigger when calorie goal is met
  useEffect(() => {
    if (!summary) return;
    const dailyCaloriesGoal = summary.dailyCaloriesGoal || 2000;
    const caloriesConsumed = summary.caloriesConsumed || 0;
    const caloriesBurned = summary.caloriesBurned || 0;
    const pct = Math.min(100, (caloriesConsumed / (dailyCaloriesGoal + caloriesBurned)) * 100);
    
    if (pct >= 100 && prevCaloriePercent.current < 100) {
      triggerCalorieConfetti();
    } else if (pct < 100) {
      setCalorieCelebrated(false);
    }
    prevCaloriePercent.current = pct;
  }, [summary]);

  // Confetti trigger when water goal is met
  useEffect(() => {
    if (!summary) return;
    const goal = summary.waterGoal || 2500;
    const consumed = summary.waterConsumedMl || 0;
    const pct = Math.min(100, (consumed / goal) * 100);

    if (pct >= 100 && prevWaterMl.current < goal) {
      setWaterCelebrated(true);
      const particles = Array.from({ length: 32 }, (_, i) => ({
        x: Math.random() * 260,
        y: Math.random() * 180,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 400,
      }));
      setWaterConfetti(particles);
      setTimeout(() => setWaterConfetti([]), 1800);
    } else if (pct < 100) {
      setWaterCelebrated(false);
    }
    prevWaterMl.current = consumed;
  }, [summary]);

  const handleAddWater = async (amount: number) => {
    if (!summary) return;

    // Trigger pulse, swell, and text scaling states
    setWaterPulsing(true);
    setWaterSwelling(true);
    setWaterTextScaling(true);
    setTimeout(() => {
      setWaterPulsing(false);
      setWaterSwelling(false);
      setWaterTextScaling(false);
    }, 600);

    // Create water splash particles centered above the text inside the circular bubble (56, 40)
    const splashColors = ['#A2D2DF', '#81B5CA', '#FFF1E6', '#FF9E8A'];
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: 56 + (Math.random() - 0.5) * 30,
      y: 40 + (Math.random() - 0.5) * 10,
      dx: `${(Math.random() - 0.5) * 70}px`,
      dy: `${-Math.random() * 40 - 20}px`,
      color: splashColors[i % splashColors.length],
    }));
    setWaterSplashParticles(newParticles);
    setTimeout(() => setWaterSplashParticles([]), 750);

    try {
      const newAmount = summary.waterConsumedMl + amount;
      const res = await api.post('/api/water', { date, amountMl: newAmount });
      setSummary({ ...summary, waterConsumedMl: res.data.amountMl });
      // Slosh animation
      setWaterSloshing(true);
      setTimeout(() => setWaterSloshing(false), 650);
    } catch (err) {
      console.error(err);
    }
  };


  const handleDeleteMeal = async (mealId: number) => {
    try {
      await api.delete(`/api/meals/${mealId}`);
      setDeleteMealId(null);
      fetchDashboardData(); // Refresh summary calculations
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">Assembling your health profile...</p>
      </div>
    );
  }

  // Fallbacks if data empty
  const dailyCaloriesGoal = summary?.dailyCaloriesGoal || 2000;
  const caloriesConsumed = summary?.caloriesConsumed || 0;
  const caloriesBurned = summary?.caloriesBurned || 0;
  const caloriesRemaining = Math.max(0, dailyCaloriesGoal - caloriesConsumed + caloriesBurned);
  const caloriePercent = Math.min(100, (caloriesConsumed / (dailyCaloriesGoal + caloriesBurned)) * 100);

  const proteinConsumed = summary?.proteinConsumed || 0;
  const proteinGoal = summary?.dailyProteinGoal || 150;
  const carbsConsumed = summary?.carbsConsumed || 0;
  const carbsGoal = summary?.dailyCarbsGoal || 225;
  const fatConsumed = summary?.fatConsumed || 0;
  const fatGoal = summary?.dailyFatGoal || 65;

  const todayMeals = summary?.todayMeals || [];

  // Macro pie data
  const pieData = [
    { name: 'Protein', value: proteinConsumed * 4, color: '#10b981' },
    { name: 'Carbohydrates', value: carbsConsumed * 4, color: '#3b82f6' },
    { name: 'Fats', value: fatConsumed * 9, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  const defaultPieData = [
    { name: 'Protein', value: 30, color: '#10b981' },
    { name: 'Carbs', value: 45, color: '#3b82f6' },
    { name: 'Fats', value: 25, color: '#f59e0b' }
  ];

  // Progressive calorie ring stage
  const getCalorieRingColor = (pct: number) => {
    if (pct >= 100) return '#B56A45'; // terracotta complete
    if (pct >= 31)  return '#FF9E8A'; // coral active
    return 'rgba(0, 0, 0, 0.05)'; // light warm sand low
  };

  const handleDownloadReport = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/reports/download?days=7&token=${token}`, '_blank');
  };

  const dashboardGlasses = Math.min(8, Math.round((summary?.waterConsumedMl || 0) / 250));
  const dashboardWaterRatio = dashboardGlasses / 8;
  const dStartR = Math.round(162 + (184 - 162) * dashboardWaterRatio);
  const dStartG = Math.round(210 + (225 - 210) * dashboardWaterRatio);
  const dStartB = Math.round(223 + (212 - 223) * dashboardWaterRatio);
  const dEndR = Math.round(129 + (133 - 129) * dashboardWaterRatio);
  const dEndG = Math.round(181 + (199 - 181) * dashboardWaterRatio);
  const dEndB = Math.round(202 + (183 - 202) * dashboardWaterRatio);
  const dashAquaTealStart = `rgb(${dStartR}, ${dStartG}, ${dStartB})`;
  const dashAquaTealEnd = `rgb(${dEndR}, ${dEndG}, ${dEndB})`;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header with Profile Look & Theme Options */}
      <div className="glass p-6 rounded-3xl border border-white/50 bg-white/20 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-up" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center gap-4 text-left">
          {/* User profile avatar with crown */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl border border-white/60 bg-white/40 overflow-hidden flex items-center justify-center shadow-md">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#FFF0EB] to-[#FFE3D4] flex items-center justify-center">
                  <span className="font-black text-lg text-[#B56A45]">
                    {(user.name || 'User').substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <Crown size={16} className="text-[#F4C542] fill-[#F4C542] absolute -top-2.5 -right-2 rotate-12 drop-shadow-sm animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">
              Hi, {user.name || 'User'}!
            </h2>
            <p className="text-slate-500 text-xs font-bold mt-0.5">Here is your nutritional breakdown for today.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Calendar Date Picker Widget */}
          <div className="flex items-center gap-2 bg-white/60 border border-white/80 px-3 py-2 rounded-2xl shadow-sm">
            <Calendar size={16} className="text-primary-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
            />
            {date !== new Date().toISOString().split('T')[0] && (
              <button
                onClick={() => setDate(new Date().toISOString().split('T')[0])}
                className="text-[10px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-200 shadow-2xs transition active:scale-95"
                title="Reset to today"
              >
                Today
              </button>
            )}
          </div>

          <div className="flex gap-2.5">
            <Link
              to="/dashboard/log-meal"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#85C7B7] hover:bg-[#6FAFA1] text-white text-xs font-bold rounded-xl shadow-card transition duration-200 active:scale-95"
            >
              <Plus size={14} />
              <span>Log Meal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* AI Smart Reminder */}
      {aiReminder && (
        <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-2xl p-4 flex items-center gap-4 animate-fade-up shadow-sm" style={{ animationDelay: '100ms' }}>
          <div className="p-2.5 bg-emerald-100/50 rounded-xl text-emerald-600">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wider text-emerald-700 uppercase mb-1">Ria's Smart Reminder</h4>
            <p className="text-sm font-semibold text-emerald-900">{aiReminder}</p>
          </div>
        </div>
      )}

      {/* Overall Daily Outcome */}
      <div className="card-light p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-100/50 rounded-xl text-primary-600 mt-1 shadow-sm">
            <Award size={28} />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-800">Daily Outcome Summary</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed font-semibold">
              {todayMeals.length === 0 
                ? "You haven't logged any meals yet. Start tracking to see your outcome! " 
                : caloriesRemaining > 0 
                  ? `Great job! You are in a caloric deficit of ${Math.round(caloriesRemaining)} kcal. ` 
                  : `You are over your budget by ${Math.round(Math.abs(caloriesRemaining))} kcal. `}
            </p>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed font-semibold">
              {summary?.waterConsumedMl >= (summary?.waterGoal || 2500) 
                ? "Hydration goal met! 💧 " 
                : `Drink ${Math.max(0, (summary?.waterGoal || 2500) - (summary?.waterConsumedMl || 0))} ml more to hit your water goal. `}
              {caloriesBurned > 0 ? `You've burned ${caloriesBurned} kcal through exercise today! 🏃‍♂️` : "No exercise logged yet."}
            </p>
          </div>
        </div>

        {/* The attractive chart for Overall Outcome */}
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'Calories', Goal: dailyCaloriesGoal, Current: caloriesConsumed },
                { name: 'Water', Goal: summary?.waterGoal || 2500, Current: summary?.waterConsumedMl || 0 },
                { name: 'Exercise', Goal: 400, Current: caloriesBurned }
              ]}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
              <XAxis dataKey="name" stroke="#8A817C" fontSize={11} tickLine={false} axisLine={false} className="font-bold" />
              <YAxis stroke="#8A817C" fontSize={11} tickLine={false} axisLine={false} className="font-bold" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)', color: '#463F3A', borderRadius: '12px', boxShadow: '0 10px 30px rgba(181, 106, 69, 0.05)' }} 
                cursor={{ fill: 'rgba(255, 255, 255, 0.25)', opacity: 0.8 }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#8A817C', fontWeight: 'bold' }} />
              <Bar dataKey="Goal" fill="#FFE3D4" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Current" fill="#FF9E8A" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Bento Card 1: Energy & Calorie Progress Ring + Macros (Span 2) */}
        <div className={`card-light p-6 rounded-3xl lg:col-span-2 flex flex-col justify-between relative overflow-hidden transition-all duration-500 animate-fade-up ${
          calorieCelebrated ? 'card-celebratory animate-card-elevate' : ''
        }`} style={{ animationDelay: '300ms' }}>
          {calorieConfetti.length > 0 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
              {calorieConfetti.map((p, i) => (
                <ConfettiParticle key={i} {...p} />
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-base text-slate-800">Energy Summary</h3>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Today</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-around gap-6">
            {/* Calorie Progress Circle */}
            <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
              <svg className={`w-full h-full transform -rotate-90 ${calorieCelebrated ? 'animate-ring-pulse' : ''}`}>
                <circle cx="80" cy="80" r="68" className="stroke-slate-200/50 fill-transparent" strokeWidth="10" />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="transparent"
                  strokeWidth="10"
                  strokeDasharray={427}
                  strokeDashoffset={427 - (427 * caloriePercent) / 100}
                  strokeLinecap="round"
                  stroke={getCalorieRingColor(caloriePercent)}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-3xl font-extrabold tracking-tight transition-colors duration-500 ${
                  calorieCelebrated ? 'text-[#B56A45]' : 'text-slate-800'
                }`}><AnimatedNumber value={Math.round(caloriesRemaining)} /></span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                  {calorieCelebrated ? '🎯 target met' : 'kcal left'}
                </span>
              </div>
            </div>

            {/* Macros Stack */}
            <div className="flex-1 w-full space-y-4">
              {/* Protein Progress */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#8ce6bf] rounded-full"></span>
                    Protein
                  </span>
                  <span className="text-slate-500 font-semibold">
                    {Math.round(proteinConsumed)}g / {Math.round(proteinGoal)}g
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#8ce6bf] rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (proteinConsumed / proteinGoal) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Carbs Progress */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-blue-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Carbs
                  </span>
                  <span className="text-slate-500 font-semibold">
                    {Math.round(carbsConsumed)}g / {Math.round(carbsGoal)}g
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (carbsConsumed / carbsGoal) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Fat Progress */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-primary-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                    Fats
                  </span>
                  <span className="text-slate-500 font-semibold">
                    {Math.round(fatConsumed)}g / {Math.round(fatGoal)}g
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-550 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (fatConsumed / fatGoal) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Card 2: Interactive Water Intake (Span 1) */}
        <div className={`card-light p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden transition-all duration-500 animate-fade-up ${
          waterCelebrated ? 'card-celebratory animate-card-elevate' : ''
        }`} style={{ animationDelay: '400ms' }}>
          {waterConfetti.length > 0 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
              {waterConfetti.map((p, i) => (
                <ConfettiParticle key={i} {...p} />
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-base text-slate-800">Water Intake</h3>
            <Droplet className="text-[#014F86]" size={20} />
          </div>

          <div className="flex items-center gap-6 mb-6 justify-center">
            {/* Circular Wave Bubble Tracker */}
            <div className={`relative w-28 h-28 rounded-full border-4 border-[#014F86]/25 overflow-hidden bg-white/35 shadow-inner flex flex-col justify-end items-center group hover:scale-105 transition-all duration-300 ${
              waterSwelling ? 'scale-105 border-[#014F86]/45' : ''
            }`}>
              
              {/* Rising Water Level */}
              <div
                className={`w-full relative overflow-hidden flex flex-col justify-end ${
                  waterSloshing ? 'animate-water-slosh' : ''
                }`}
                style={{
                  height: `${Math.min(100, ((summary?.waterConsumedMl || 0) / (summary?.waterGoal || 2500)) * 100)}%`,
                  background: `linear-gradient(180deg, ${dashAquaTealStart} 0%, ${dashAquaTealEnd} 100%)`,
                  transition: 'height 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                {/* Layered Animated Wave SVGs */}
                {((summary?.waterConsumedMl || 0) / (summary?.waterGoal || 2500)) * 100 > 0 && ((summary?.waterConsumedMl || 0) / (summary?.waterGoal || 2500)) * 100 < 100 && (
                  <>
                    <svg 
                      className="absolute left-0 right-0 w-[200%] h-6 text-[#2C7DA0]/35 fill-current -top-5 animate-water-wave"
                      viewBox="0 0 1200 120"
                      preserveAspectRatio="none"
                    >
                      <path d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1350,20 1500,60 L1500,120 L0,120 Z" />
                    </svg>
                    <svg 
                      className="absolute left-0 right-0 w-[200%] h-6 text-[#014F86]/20 fill-current -top-4 animate-water-wave-slow"
                      viewBox="0 0 1200 120"
                      preserveAspectRatio="none"
                    >
                      <path d="M0,50 C150,10 350,90 500,50 C650,10 850,90 1000,50 C1150,10 1350,90 1500,50 L1500,120 L0,120 Z" />
                    </svg>
                  </>
                )}

                {/* Floating Bubbles */}
                {((summary?.waterConsumedMl || 0) / (summary?.waterGoal || 2500)) * 100 > 5 && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute bottom-2 left-4 w-1.5 h-1.5 bg-white/20 rounded-full animate-bubble-up-1"></div>
                    <div className="absolute bottom-6 right-6 w-1 h-1 bg-white/30 rounded-full animate-bubble-up-2"></div>
                    <div className="absolute bottom-10 left-8 w-2 h-2 bg-white/10 rounded-full animate-bubble-up-3"></div>
                  </div>
                )}
              </div>

              {/* Warm peach refraction pulse overlay */}
              <div 
                className={`absolute inset-0 bg-[#FFE3D4] mix-blend-color-dodge pointer-events-none z-20 transition-opacity duration-500 rounded-full ${
                  waterPulsing ? 'opacity-45' : 'opacity-0'
                }`}
              />

              {/* Momentary sparkles on pulse */}
              {waterPulsing && (
                <>
                  <Sparkles size={14} className="absolute top-4 left-6 text-white animate-bounce pointer-events-none z-30" />
                  <Sparkles size={10} className="absolute bottom-5 right-5 text-[#FFE3D4] animate-pulse pointer-events-none z-30" />
                </>
              )}

              {/* Dynamic Centered Status Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <Droplet 
                  size={22} 
                  className={`transition-colors duration-500 ${
                    ((summary?.waterConsumedMl || 0) / (summary?.waterGoal || 2500)) * 100 > 45 
                      ? 'text-white' 
                      : 'text-[#014F86]'
                  }`} 
                />
                <span 
                  className={`text-xs font-black transition-colors duration-500 mt-0.5 ${
                    ((summary?.waterConsumedMl || 0) / (summary?.waterGoal || 2500)) * 100 > 60 
                      ? 'text-white' 
                      : 'text-slate-800'
                  }`}
                >
                  {Math.round(Math.min(100, ((summary?.waterConsumedMl || 0) / (summary?.waterGoal || 2500)) * 100))}%
                </span>
              </div>

              {/* Splash Particles Overlay inside the bubble */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
                {waterSplashParticles.map(p => (
                  <span
                    key={p.id}
                    className="absolute w-1.5 h-1.5 rounded-full animate-particle"
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

            <div>
              <p className={`text-4xl font-extrabold transition-all duration-300 ${
                waterTextScaling ? 'scale-110 text-primary-655' : 'scale-100 text-[#014F86]'
              }`}>
                {Math.min(8, Math.round((summary?.waterConsumedMl || 0) / 250))} <span className="text-lg font-bold text-slate-500">/ 8</span>
              </p>
              <p className="text-xs text-slate-550 font-bold mt-1">Goal: 8 Glasses</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAddWater(250)}
              className="py-2.5 bg-blue-50/70 hover:bg-blue-100/90 border border-blue-200 text-xs font-bold rounded-xl text-[#014F86] transition-all active:scale-95 shadow-sm"
            >
              +250ml Glass
            </button>
            <button
              onClick={() => handleAddWater(500)}
              className="py-2.5 bg-blue-100/50 hover:bg-blue-200/70 border border-[#2C7DA0]/30 text-xs font-bold rounded-xl text-[#014F86] transition-all active:scale-95 shadow-sm"
            >
              +500ml Bottle
            </button>
          </div>
        </div>

        {/* Bento Card 3: Springy Workouts Checklist (Span 1) */}
        <div className="card-light p-6 rounded-3xl flex flex-col justify-between animate-fade-up" style={{ animationDelay: '500ms' }}>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base text-slate-800">Your Plan Checklist</h3>
              <ChevronRight className="text-slate-500" size={18} />
            </div>

            <div className="space-y-3">
              {exercisesChecklist.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3.5 glass rounded-2xl flex items-center justify-between gap-4 transition-all duration-350 ${
                    item.completed ? 'opacity-80 bg-emerald-50/20 border-emerald-100/30' : 'opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleChecklist(item.id)}
                      disabled={item.completed}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        item.completed 
                          ? 'bg-emerald-500 border-emerald-500 text-white cursor-default' 
                          : 'border-slate-350 hover:border-slate-500 bg-white/30 cursor-pointer active:scale-90'
                      }`}
                    >
                      {item.completed && (
                        <svg className="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </button>
                    <div>
                      <p className={`text-xs font-bold text-left transition-all ${item.completed ? 'line-through text-emerald-800' : 'text-slate-850'}`}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-550 font-bold mt-0.5 text-left">
                        {item.completed ? 'Completed (resets in 24h)' : item.duration}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg">{item.category === 'Yoga' ? '🧘‍♀️' : item.category === 'Walk' ? '🚶‍♂️' : '🏋️'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-355 flex justify-between items-center text-xs font-bold text-slate-500">
            <button
              onClick={() => {
                setExercisesChecklist(prev => prev.map(e => ({ ...e, completed: false })));
                localStorage.removeItem('completed-exercises-ids');
              }}
              className="text-[9px] uppercase tracking-wider text-slate-400 hover:text-slate-655 underline font-bold"
            >
              Reset Plan
            </button>
            <span className="text-primary-600">{exercisesChecklist.filter(e => e.completed).length} / {exercisesChecklist.length}</span>
          </div>
        </div>

        {/* Bento Card 4: Interactive Sleep Tracker (Span 1) */}
        <div className="card-light p-6 rounded-3xl flex flex-col justify-between animate-fade-up" style={{ animationDelay: '600ms' }}>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base text-slate-800">Sleep Time</h3>
              <span className="text-lg">😴</span>
            </div>

            <div className="flex items-center justify-center py-4 relative">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-primary-650">{sleepHours} <span className="text-base font-semibold text-slate-500">hrs</span></p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                  {sleepPercent >= 100 ? '🎉 goal met!' : 'sweet dreams'}
                </p>
              </div>
            </div>

            <div className="w-full h-3 bg-slate-200/50 rounded-full overflow-hidden mt-2 relative">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-700" 
                style={{ width: `${sleepPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <span className="text-xs text-slate-500 font-bold">Goal: {sleepGoal} hrs</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setSleepHours(prev => Math.max(0, prev - 0.5))} 
                className="w-8 h-8 rounded-xl glass border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-white/60 active:scale-90 transition-all duration-200"
              >
                -
              </button>
              <button 
                onClick={() => setSleepHours(prev => Math.min(12, prev + 0.5))} 
                className="w-8 h-8 rounded-xl glass border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-white/60 active:scale-90 transition-all duration-200"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Bento Card 5: AI Coach Suggestion (Span 1) */}
        <div className="card-light p-6 rounded-3xl bg-emerald-50/55 border border-emerald-100 relative overflow-hidden flex flex-col justify-between animate-fade-up" style={{ animationDelay: '700ms' }}>
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-4">
              <Sparkles size={14} />
              <span>AI Coach Tip of the Day</span>
            </div>
            <p className="text-slate-750 text-xs leading-relaxed font-semibold">
              "You logged Rolled Oats for breakfast. Adding a scoop of whey protein increases muscle protein synthesis and keeps you sated for 4+ hours."
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-emerald-150">
            <Link to="/dashboard/ai-coach" className="text-emerald-600 text-xs font-bold flex items-center hover:underline active:scale-95 transition-transform duration-100">
              <span>Ask AI Coach</span>
              <ChevronRight size={12} className="mt-0.5 ml-1" />
            </Link>
          </div>
        </div>

      </div>

      {/* Meals & Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Logged Meals List */}
        <div className="card-light p-6 rounded-3xl lg:col-span-2 animate-fade-up" style={{ animationDelay: '800ms' }}>
          <h3 className="font-extrabold text-base mb-6 text-slate-800">Today's Meals</h3>

          {todayMeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-300 bg-white/20 rounded-2xl">
              <Utensils className="text-slate-400 mb-3" size={32} />
              <p className="text-slate-600 text-sm font-bold">No meals logged for today.</p>
              <Link to="/dashboard/log-meal" className="text-xs text-primary-600 hover:underline mt-1.5 font-bold">
                Log a food item now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {todayMeals.map((meal: any) => (
                <div key={meal.id} className="p-4 bg-white/40 border border-white/30 shadow-sm rounded-2xl flex items-center justify-between gap-4 transition-all hover:bg-white/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100/50 border border-primary-200/50 flex items-center justify-center font-bold text-primary-650 text-xs uppercase">
                      {meal.mealType[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-850 uppercase tracking-wide">{meal.mealType}</h4>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">
                        {meal.mealItems.length} items logged
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-800">{meal.totalCalories} kcal</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                        P: {meal.totalProtein}g | C: {meal.totalCarbs}g | F: {meal.totalFat}g
                      </p>
                    </div>
                    <button
                      onClick={() => setDeleteMealId(meal.id)}
                      className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50/50 rounded-xl transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Charts & Distributions */}
        <div className="card-light p-6 rounded-3xl animate-fade-up" style={{ animationDelay: '900ms' }}>
          <h3 className="font-extrabold text-base mb-6 text-slate-800">Macro Distribution</h3>
          
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : defaultPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(pieData.length > 0 ? pieData : defaultPieData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)', color: '#463F3A', borderRadius: '12px', boxShadow: '0 10px 30px rgba(181, 106, 69, 0.05)' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2.5 mt-4 text-xs font-bold text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-[#6fc29d] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#8ce6bf] rounded-sm"></span>
                Protein ({pieData.length > 0 ? Math.round((proteinConsumed * 4 / (proteinConsumed*4 + carbsConsumed*4 + fatConsumed*9)) * 100) : 30}%)
              </span>
              <span className="text-slate-700">{Math.round(proteinConsumed * 4)} kcal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-650 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>
                Carbohydrates ({pieData.length > 0 ? Math.round((carbsConsumed * 4 / (proteinConsumed*4 + carbsConsumed*4 + fatConsumed*9)) * 100) : 45}%)
              </span>
              <span className="text-slate-700">{Math.round(carbsConsumed * 4)} kcal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-650 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-primary-500 rounded-sm"></span>
                Fats ({pieData.length > 0 ? Math.round((fatConsumed * 9 / (proteinConsumed*4 + carbsConsumed*4 + fatConsumed*9)) * 100) : 25}%)
              </span>
              <span className="text-slate-700">{Math.round(fatConsumed * 9)} kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Visual Weekly & Monthly Historical Summary Section ─── */}
      <div className="card-light p-6 md:p-8 rounded-3xl space-y-6 animate-fade-up border border-white/60 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary-600 mb-1">
              <TrendingUp size={16} />
              <span>Historical Analytics</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800">
              {summaryTimeframe === 7 ? 'Weekly' : 'Monthly'} Performance Summary
            </h3>
            <p className="text-slate-500 text-xs font-bold mt-0.5">
              Visual histogram of caloric intake vs exercise burn & aggregate macro distribution over {summaryTimeframe} days.
            </p>
          </div>

          {/* Timeframe selector tabs */}
          <div className="flex bg-white/60 border border-white/80 p-1 rounded-2xl shadow-xs self-start md:self-auto">
            <button
              onClick={() => setSummaryTimeframe(7)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition duration-200 ${
                summaryTimeframe === 7
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days (Weekly)
            </button>
            <button
              onClick={() => setSummaryTimeframe(30)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition duration-200 ${
                summaryTimeframe === 30
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days (Monthly)
            </button>
          </div>
        </div>

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/40 border border-white/70 p-4 rounded-2xl text-left shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Avg Daily Intake</p>
            <p className="text-xl font-black text-slate-800 mt-1">
              {historicalData.length > 0 
                ? Math.round(historicalData.reduce((acc, c) => acc + c.consumed, 0) / historicalData.length) 
                : 0} <span className="text-xs font-semibold text-slate-500">kcal/day</span>
            </p>
          </div>

          <div className="bg-white/40 border border-white/70 p-4 rounded-2xl text-left shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Water Logged</p>
            <p className="text-xl font-black text-blue-600 mt-1">
              {(historicalData.reduce((acc, c) => acc + c.water, 0) / 1000).toFixed(1)} <span className="text-xs font-semibold text-slate-500">Liters</span>
            </p>
          </div>

          <div className="bg-white/40 border border-white/70 p-4 rounded-2xl text-left shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Active Burn</p>
            <p className="text-xl font-black text-emerald-600 mt-1">
              {historicalData.reduce((acc, c) => acc + c.burned, 0)} <span className="text-xs font-semibold text-slate-500">kcal burned</span>
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Histogram Chart (Intake vs Burned) */}
          <div className="lg:col-span-2 bg-white/40 border border-white/70 p-5 rounded-2xl">
            <h4 className="font-extrabold text-sm text-slate-800 mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-primary-600" />
              <span>Daily Caloric Intake vs. Exercise Burn Histogram</span>
            </h4>
            <div className="h-64 w-full">
              {historicalLoading ? (
                <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400">Loading summary data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                    <XAxis dataKey="date" stroke="#8A817C" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8A817C" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.6)', color: '#463F3A', borderRadius: '12px', boxShadow: '0 10px 30px rgba(181, 106, 69, 0.08)' }} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#8A817C', fontWeight: 'bold' }} />
                    <Bar dataKey="consumed" name="Consumed (kcal)" fill="#FF9E8A" radius={[4, 4, 0, 0]} barSize={summaryTimeframe === 7 ? 20 : 8} />
                    <Bar dataKey="burned" name="Burned (kcal)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={summaryTimeframe === 7 ? 20 : 8} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Macro Aggregate Pie / Donut Chart */}
          <div className="bg-white/40 border border-white/70 p-5 rounded-2xl flex flex-col justify-between">
            <h4 className="font-extrabold text-sm text-slate-800 mb-2 flex items-center gap-2">
              <PieChartIcon size={16} className="text-primary-600" />
              <span>Aggregate Macro Distribution</span>
            </h4>
            <div className="h-44 w-full relative flex items-center justify-center">
              {historicalLoading ? (
                <div className="text-xs font-bold text-slate-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Protein', value: historicalData.reduce((a, c) => a + c.protein, 0) * 4, color: '#10b981' },
                        { name: 'Carbohydrates', value: historicalData.reduce((a, c) => a + c.carbs, 0) * 4, color: '#3b82f6' },
                        { name: 'Fats', value: historicalData.reduce((a, c) => a + c.fat, 0) * 9, color: '#f59e0b' }
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={62}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {[
                        { name: 'Protein', value: historicalData.reduce((a, c) => a + c.protein, 0) * 4, color: '#10b981' },
                        { name: 'Carbohydrates', value: historicalData.reduce((a, c) => a + c.carbs, 0) * 4, color: '#3b82f6' },
                        { name: 'Fats', value: historicalData.reduce((a, c) => a + c.fat, 0) * 9, color: '#f59e0b' }
                      ].filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`hist-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.6)', color: '#463F3A', borderRadius: '12px', boxShadow: '0 10px 30px rgba(181, 106, 69, 0.08)' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-1.5 text-xs font-bold text-slate-600 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-[#10b981] flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#10b981] rounded-full"></span>
                  Protein
                </span>
                <span className="text-slate-700">{historicalData.reduce((a, c) => a + c.protein, 0)}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Carbs
                </span>
                <span className="text-slate-700">{historicalData.reduce((a, c) => a + c.carbs, 0)}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Fats
                </span>
                <span className="text-slate-700">{historicalData.reduce((a, c) => a + c.fat, 0)}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Meal Confirmation Modal */}
      {deleteMealId !== null && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-2xl animate-elastic-drop flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-55 border border-red-200 flex items-center justify-center text-red-500 shadow-sm shadow-red-500/10 animate-bounce">
              <HelpCircle size={22} className="text-red-550" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">Delete logged meal?</h3>
              <p className="text-xs text-slate-550 font-bold leading-relaxed">
                Are you sure you want to delete this meal log entry? Your consumed calories and macros for today will be updated.
              </p>
            </div>
            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => setDeleteMealId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-205 text-slate-650 font-bold text-xs rounded-xl transition duration-205"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMeal(deleteMealId)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-md transition duration-205"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
