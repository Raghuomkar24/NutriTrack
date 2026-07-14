import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Legend, Line 
} from 'recharts';
import { Download, Activity } from 'lucide-react';
import api from '../api';

const Analytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState(7);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const histData = [];

      // Query weight logs
      const weightRes = await api.get('/api/weight');
      setWeightHistory(weightRes.data);

      // Loop dates in timeframe to load meal and water logs for compilation
      for (let i = timeframe - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Fetch logs for this date
        const mealRes = await api.get(`/api/meals?date=${dateStr}`);
        const waterRes = await api.get(`/api/water?date=${dateStr}`);
        const exerciseRes = await api.get(`/api/exercise?date=${dateStr}`);

        const totalCalories = mealRes.data.reduce((sum: number, m: any) => sum + m.totalCalories, 0);
        const totalProtein = mealRes.data.reduce((sum: number, m: any) => sum + m.totalProtein, 0);
        const totalCarbs = mealRes.data.reduce((sum: number, m: any) => sum + m.totalCarbs, 0);
        const totalFat = mealRes.data.reduce((sum: number, m: any) => sum + m.totalFat, 0);
        const waterMl = waterRes.data?.amountMl || 0;
        const exerciseBurn = exerciseRes.data.reduce((sum: number, e: any) => sum + e.caloriesBurned, 0);

        // Format short date (e.g. Jul 13)
        const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        histData.push({
          date: displayDate,
          calories: totalCalories,
          targetCalories: 2000, // standard default
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
          water: waterMl,
          burned: exerciseBurn
        });
      }

      setChartData(histData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const handleDownloadReport = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/reports/download?days=${timeframe}&token=${token}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs">Compiling analytics charts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Analytics & Reports</h2>
          <p className="text-slate-400 text-sm">Monitor trends, analyze caloric intake, and export detailed PDFs.</p>
        </div>

        <div className="flex gap-2">
          {/* Timeframe Select */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setTimeframe(7)}
              className={`px-3 py-1.5 rounded-lg transition ${timeframe === 7 ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeframe(30)}
              className={`px-3 py-1.5 rounded-lg transition ${timeframe === 30 ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-xs font-bold rounded-xl shadow-glass shadow-green-500/10 transition"
          >
            <Download size={14} />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Caloric Intake Chart */}
        <div className="glass p-6 rounded-3xl border border-slate-800">
          <h3 className="font-extrabold text-base mb-6 text-slate-300">Calorie Intake vs. Target</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="calories" fill="#16a34a" name="Consumed (kcal)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="targetCalories" stroke="#ea580c" strokeWidth={2} name="Calorie Target" dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protein and Macro Trends */}
        <div className="glass p-6 rounded-3xl border border-slate-800">
          <h3 className="font-extrabold text-base mb-6 text-slate-300">Macro Trend Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="protein" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Protein (g)" />
                <Area type="monotone" dataKey="carbs" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Carbohydrates (g)" />
                <Area type="monotone" dataKey="fat" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="Fat (g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weight Curve Chart */}
        <div className="glass p-6 rounded-3xl border border-slate-800">
          <h3 className="font-extrabold text-base mb-6 text-slate-300">Weight Tracker Curve</h3>
          {weightHistory.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl">
              <Activity className="text-slate-600 mb-3" size={32} />
              <p className="text-slate-400 text-sm font-medium">No weight logs available.</p>
              <p className="text-xs text-slate-500 mt-1">Add weights in the Weight tab.</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightHistory.map(w => ({
                  date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  weight: w.weight
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="weight" stroke="#10b981" fill="rgba(16, 185, 129, 0.15)" strokeWidth={2} name="Weight (kg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Water Hydration Log */}
        <div className="glass p-6 rounded-3xl border border-slate-800">
          <h3 className="font-extrabold text-base mb-6 text-slate-300">Hydration Progress (ml)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="water" fill="#3b82f6" name="Water (ml)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
