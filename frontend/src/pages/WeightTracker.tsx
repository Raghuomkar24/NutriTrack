import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { Scale, Calendar, TrendingDown } from 'lucide-react';
import api from '../api';

const WeightTracker: React.FC = () => {
  const [weight, setWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [success, setSuccess] = useState('');

  const fetchWeightData = async () => {
    try {
      const res = await api.get('/api/weight');
      setWeightHistory(res.data);

      const profileRes = await api.get('/api/profile');
      setProfile(profileRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) return;

    try {
      await api.post('/api/weight', { date, weight: parsedWeight });
      setSuccess('Weight logged successfully!');
      setWeight('');
      fetchWeightData(); // Reload history and profile metrics
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs">Loading weight logs...</p>
      </div>
    );
  }

  // Calculate stats
  const currentWeight = profile?.weight || 0;
  const targetWeight = profile?.targetWeight || 0;
  const bmi = profile?.bmi || 0;
  const weightDiff = Math.abs(currentWeight - targetWeight);

  const formattedChartData = weightHistory.map(w => ({
    date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: w.weight
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Weight Tracker</h2>
          <p className="text-slate-400 text-sm">Monitor weight fluctuations, calculate BMI, and track goal completions.</p>
        </div>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-5 rounded-3xl border border-slate-800">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Current Weight</p>
          <p className="text-2xl font-extrabold text-slate-200 mt-1">{currentWeight} kg</p>
        </div>
        <div className="glass p-5 rounded-3xl border border-slate-800">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Target Weight</p>
          <p className="text-2xl font-extrabold text-green-400 mt-1">{targetWeight} kg</p>
        </div>
        <div className="glass p-5 rounded-3xl border border-slate-800">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Body Mass Index (BMI)</p>
          <p className="text-2xl font-extrabold text-blue-400 mt-1">{bmi}</p>
        </div>
        <div className="glass p-5 rounded-3xl border border-slate-800">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Distance to Goal</p>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">{weightDiff.toFixed(1)} kg</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Log Form */}
        <div className="glass p-6 rounded-3xl border border-slate-800">
          <h3 className="font-extrabold text-base mb-6 text-slate-300">Log New Weight</h3>

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Log Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Weight (kg)</label>
              <div className="relative">
                <Scale className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  placeholder="e.g. 78.5"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 font-bold rounded-xl shadow-glass shadow-green-500/20 transition duration-200"
            >
              Save Record
            </button>
          </form>
        </div>

        {/* Chart View */}
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-slate-800 flex flex-col">
          <h3 className="font-extrabold text-base mb-6 text-slate-300">Weight Log Curve</h3>
          
          {weightHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl py-12">
              <TrendingDown className="text-slate-600 mb-3" size={32} />
              <p className="text-slate-400 text-sm font-medium">No records logged yet.</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="weight" stroke="#10b981" fill="rgba(16, 185, 129, 0.15)" strokeWidth={2} name="Weight (kg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeightTracker;
