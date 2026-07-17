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
    } catch (err) {
      console.error("Failed to fetch weight history:", err);
    }

    try {
      const profileRes = await api.get('/api/profile');
      setProfile(profileRes.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
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
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-semibold">Loading weight logs...</p>
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
          <p className="text-slate-500 text-sm font-semibold">Monitor weight fluctuations, calculate BMI, and track goal completions.</p>
        </div>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-5 rounded-3xl bg-white/35">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Weight</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{currentWeight} kg</p>
        </div>
        <div className="glass p-5 rounded-3xl bg-white/35">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Target Weight</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{targetWeight} kg</p>
        </div>
        <div className="glass p-5 rounded-3xl bg-white/35">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Body Mass Index (BMI)</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{bmi}</p>
        </div>
        <div className="glass p-5 rounded-3xl bg-white/35">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Distance to Goal</p>
          <p className="text-2xl font-extrabold text-primary-600 mt-1">{weightDiff.toFixed(1)} kg</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Log Form */}
        <div className="glass p-6 rounded-3xl bg-white/35">
          <h3 className="font-extrabold text-base mb-6 text-slate-800">Log New Weight</h3>

          {success && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold rounded-xl text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Log Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 text-slate-500" size={14} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Weight (kg)</label>
              <div className="relative">
                <Scale className="absolute left-3.5 top-3.5 text-slate-500" size={14} />
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 font-bold"
                  placeholder="e.g. 78.5"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition duration-200 shadow-md shadow-primary-600/10"
            >
              Save Record
            </button>
          </form>
        </div>

        {/* Chart View */}
        <div className="lg:col-span-2 glass p-6 rounded-3xl bg-white/35 flex flex-col">
          <h3 className="font-extrabold text-base mb-6 text-slate-800">Weight Log Curve</h3>
          
          {weightHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-primary-200 bg-white/20 rounded-2xl py-12">
              <TrendingDown className="text-slate-400 mb-3" size={32} />
              <p className="text-slate-500 text-sm font-bold">No records logged yet.</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(181, 106, 69, 0.12)" />
                  <XAxis dataKey="date" stroke="#8A817C" fontSize={11} tick={{ fontWeight: 'bold' }} />
                  <YAxis stroke="#8A817C" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFF1E6', borderColor: '#FFD2BD', color: '#463F3A', borderRadius: '16px', boxShadow: '0 8px 24px rgba(181, 106, 69, 0.08)' }} />
                  <Area type="monotone" dataKey="weight" stroke="#FF9E8A" fill="rgba(255, 158, 138, 0.15)" strokeWidth={2.5} name="Weight (kg)" />
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
