import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplet, Award, Plus, Trash2, Sparkles, ChevronRight, Download, Utensils 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  Tooltip, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import api from '../api';

const Home: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date] = useState(new Date().toISOString().split('T')[0]); // Today's date yyyy-MM-dd
  const [aiReminder, setAiReminder] = useState<string | null>(null);

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

  const handleAddWater = async (amount: number) => {
    if (!summary) return;
    try {
      const newAmount = summary.waterConsumedMl + amount;
      const res = await api.post('/api/water', { date, amountMl: newAmount });
      setSummary({ ...summary, waterConsumedMl: res.data.amountMl });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMeal = async (mealId: number) => {
    try {
      await api.delete(`/api/meals/${mealId}`);
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

  const handleDownloadReport = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/reports/download?days=7&token=${token}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Hi, {JSON.parse(localStorage.getItem('user') || '{}').name || 'John'}!
          </h2>
          <p className="text-slate-400 text-sm">Here is your nutritional breakdown for today.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2.5 glass hover:bg-slate-800 border border-slate-800 text-xs font-semibold rounded-xl transition duration-200"
          >
            <Download size={14} />
            <span>Download Report</span>
          </button>
          <Link
            to="/dashboard/log-meal"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-xs font-bold rounded-xl shadow-glass shadow-green-500/20 transition duration-200"
          >
            <Plus size={14} />
            <span>Log a Meal</span>
          </Link>
        </div>
      </div>

      {/* AI Smart Reminder */}
      {aiReminder && (
        <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-glass">
          <div className="p-2.5 bg-primary-500/20 rounded-xl text-primary-400">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wider text-primary-400 uppercase mb-1">Ria's Smart Reminder</h4>
            <p className="text-sm font-medium text-slate-200">{aiReminder}</p>
          </div>
        </div>
      )}

      {/* Overall Daily Outcome */}
      <div className="glass p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-950/20 to-slate-900/40 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 mt-1 shadow-lg shadow-indigo-500/20">
            <Award size={28} />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-200">Daily Outcome Summary</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {todayMeals.length === 0 
                ? "You haven't logged any meals yet. Start tracking to see your outcome! " 
                : caloriesRemaining > 0 
                  ? `Great job! You are in a caloric deficit of ${Math.round(caloriesRemaining)} kcal. ` 
                  : `You are over your budget by ${Math.round(Math.abs(caloriesRemaining))} kcal. `}
            </p>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }} 
                cursor={{ fill: '#1e293b', opacity: 0.4 }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Bar dataKey="Goal" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Current" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calorie Progress Ring */}
        <div className="glass p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
          <h3 className="font-extrabold text-base mb-6 text-slate-300">Energy Summary</h3>
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                className="stroke-slate-800 fill-transparent"
                strokeWidth="12"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                className="stroke-green-500 fill-transparent transition-all duration-500"
                strokeWidth="12"
                strokeDasharray={502.4}
                strokeDashoffset={502.4 - (502.4 * caloriePercent) / 100}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Text */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tracking-tight">{Math.round(caloriesRemaining)}</span>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">kcal remaining</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full pt-4 border-t border-slate-800 text-center">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Budget</p>
              <p className="text-sm font-bold mt-1">{Math.round(dailyCaloriesGoal)}</p>
            </div>
            <div className="text-slate-600 font-bold text-lg">-</div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Food</p>
              <p className="text-sm font-bold text-green-400 mt-1">{Math.round(caloriesConsumed)}</p>
            </div>
            <div className="text-slate-600 font-bold text-lg">+</div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Burned</p>
              <p className="text-sm font-bold text-orange-400 mt-1">{Math.round(caloriesBurned)}</p>
            </div>
          </div>
        </div>

        {/* Macronutrient Bars Progress */}
        <div className="glass p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <h3 className="font-extrabold text-base mb-4 text-slate-300">Macronutrients</h3>

          <div className="space-y-6">
            {/* Protein */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  Protein
                </span>
                <span className="text-slate-400">
                  {Math.round(proteinConsumed)}g / {Math.round(proteinGoal)}g
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (proteinConsumed / proteinGoal) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-blue-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Carbs
                </span>
                <span className="text-slate-400">
                  {Math.round(carbsConsumed)}g / {Math.round(carbsGoal)}g
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (carbsConsumed / carbsGoal) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  Fats
                </span>
                <span className="text-slate-400">
                  {Math.round(fatConsumed)}g / {Math.round(fatGoal)}g
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (fatConsumed / fatGoal) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-850/40 p-3 rounded-xl border border-slate-800/80 mt-6 flex items-center gap-2">
            <Award className="text-green-400 flex-shrink-0" size={16} />
            <p className="text-[11px] text-slate-400">
              Macro Distribution: 30% Protein / 45% Carbs / 25% Fats calculated automatically for your goal.
            </p>
          </div>
        </div>

        {/* Water Tracker & AI Tip Widgets */}
        <div className="space-y-6">
          {/* Water Tracker */}
          <div className="glass p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base text-slate-300">Water Intake</h3>
              <Droplet className="text-blue-400" size={20} />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-20 bg-slate-800 border-2 border-slate-700 rounded-b-2xl rounded-t-sm overflow-hidden flex items-end">
                <div 
                  className="w-full bg-blue-500 transition-all duration-500 ease-out" 
                  style={{ height: `${Math.min(100, ((summary?.waterConsumedMl || 0) / (summary?.waterGoal || 2500)) * 100)}%` }}
                ></div>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-blue-400">{summary?.waterConsumedMl || 0} ml</p>
                <p className="text-xs text-slate-500">Goal: {summary?.waterGoal || 2500} ml</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleAddWater(250)}
                className="py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-semibold rounded-xl text-blue-400 transition"
              >
                +250ml Glass
              </button>
              <button 
                onClick={() => handleAddWater(500)}
                className="py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-semibold rounded-xl text-blue-400 transition"
              >
                +500ml Bottle
              </button>
            </div>
          </div>

          {/* AI Coach Suggestion */}
          <div className="glass p-5 rounded-3xl border border-slate-800/80 bg-gradient-to-br from-green-950/20 to-emerald-950/20 relative overflow-hidden">
            <div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles size={14} />
              <span>AI Coach Tip of the Day</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mb-3">
              "You logged Rolled Oats for breakfast. Adding a scoop of whey protein increases muscle protein synthesis and keeps you sated for 4+ hours."
            </p>
            <Link to="/dashboard/ai-coach" className="text-green-400 text-[11px] font-bold flex items-center hover:underline">
              <span>Ask AI Coach</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Meals & Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Logged Meals List */}
        <div className="glass p-6 rounded-3xl border border-slate-800 lg:col-span-2">
          <h3 className="font-extrabold text-base mb-6 text-slate-300">Today's Meals</h3>

          {todayMeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-800 rounded-2xl">
              <Utensils className="text-slate-600 mb-3" size={32} />
              <p className="text-slate-400 text-sm font-medium">No meals logged for today.</p>
              <Link to="/dashboard/log-meal" className="text-xs text-green-400 hover:underline mt-1 font-semibold">
                Log a food item now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {todayMeals.map((meal: any) => (
                <div key={meal.id} className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center font-bold text-green-400 text-xs uppercase">
                      {meal.mealType[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wide">{meal.mealType}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {meal.mealItems.length} items logged
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-300">{meal.totalCalories} kcal</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        P: {meal.totalProtein}g | C: {meal.totalCarbs}g | F: {meal.totalFat}g
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
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
        <div className="glass p-6 rounded-3xl border border-slate-800">
          <h3 className="font-extrabold text-base mb-6 text-slate-300">Macro Distribution</h3>
          
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm"></span>
                Protein ({pieData.length > 0 ? Math.round((proteinConsumed * 4 / (proteinConsumed*4 + carbsConsumed*4 + fatConsumed*9)) * 100) : 30}%)
              </span>
              <span className="text-slate-400">{Math.round(proteinConsumed * 4)} kcal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-sm"></span>
                Carbohydrates ({pieData.length > 0 ? Math.round((carbsConsumed * 4 / (proteinConsumed*4 + carbsConsumed*4 + fatConsumed*9)) * 100) : 45}%)
              </span>
              <span className="text-slate-400">{Math.round(carbsConsumed * 4)} kcal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-amber-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm"></span>
                Fats ({pieData.length > 0 ? Math.round((fatConsumed * 9 / (proteinConsumed*4 + carbsConsumed*4 + fatConsumed*9)) * 100) : 25}%)
              </span>
              <span className="text-slate-400">{Math.round(fatConsumed * 9)} kcal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
