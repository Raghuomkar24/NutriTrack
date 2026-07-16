import React, { useState, useEffect } from 'react';
import { Dumbbell, Trash2, Calendar, Clock, Flame, CheckCircle } from 'lucide-react';
import api from '../api';

const ExerciseTracker: React.FC = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exerciseType, setExerciseType] = useState('RUNNING');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [distanceKm, setDistanceKm] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [submitSpring, setSubmitSpring] = useState(false);
  const [newEntryId, setNewEntryId] = useState<number | null>(null);

  // Auto-estimate MET calories
  const estimates: Record<string, number> = {
    RUNNING: 11.4, // kcal/min
    GYM: 6.6,
    CYCLING: 8.5,
    WALKING: 4.5,
    YOGA: 3.2,
    SWIMMING: 9.8
  };

  const getEstimatedBurn = () => {
    const mins = parseInt(durationMinutes) || 0;
    const factor = estimates[exerciseType] || 5;
    return Math.round(mins * factor);
  };

  const fetchExercises = async () => {
    try {
      const res = await api.get(`/api/exercise?date=${date}`);
      setExercises(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    const duration = parseInt(durationMinutes);
    if (isNaN(duration) || duration <= 0) return;

    const burned = customCalories ? parseFloat(customCalories) : getEstimatedBurn();

    // Spring animation on submit
    setSubmitSpring(true);
    setTimeout(() => setSubmitSpring(false), 380);

    try {
      const res = await api.post('/api/exercise', {
        date,
        exerciseType,
        durationMinutes: duration,
        caloriesBurned: burned,
        distanceKm: distanceKm ? parseFloat(distanceKm) : 0
      });
      setSuccess('Exercise logged successfully!');
      setNewEntryId(res.data?.id || null);
      setTimeout(() => setNewEntryId(null), 600);
      setCustomCalories('');
      setDistanceKm('');
      fetchExercises();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/exercise/${id}`);
      fetchExercises();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Exercise Tracker</h2>
        <p className="text-slate-400 text-sm">Log daily workouts and calculate active calories burned.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Form */}
        <div className="glass p-6 rounded-3xl border border-slate-800">
          <h3 className="font-extrabold text-base mb-6 text-slate-300">Log Workout</h3>

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
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Activity Type</label>
              <select
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
              >
                <option value="RUNNING" className="bg-slate-900">Running</option>
                <option value="WALKING" className="bg-slate-900">Walking</option>
                <option value="GYM" className="bg-slate-900">Gym Session</option>
                <option value="CYCLING" className="bg-slate-900">Cycling</option>
                <option value="YOGA" className="bg-slate-900">Yoga / Pilates</option>
                <option value="SWIMMING" className="bg-slate-900">Swimming</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Duration (Minutes)</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  required
                />
              </div>
            </div>

            {['RUNNING', 'WALKING', 'CYCLING', 'SWIMMING'].includes(exerciseType) && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Distance (km)</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-slate-500 font-bold text-xs pt-0.5">KM</div>
                  <input
                    type="number"
                    step="0.1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                    placeholder="e.g. 5.2"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Calories Burned (kcal)</label>
              <div className="relative">
                <Flame className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <input
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  placeholder={`Estimated: ${getEstimatedBurn()} kcal`}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 bg-primary-500 hover:bg-primary-600 font-bold rounded-xl shadow-glass shadow-green-500/20 transition-all duration-200 ${
                submitSpring ? 'animate-btn-spring' : ''
              }`}
            >
              Add Workout Log
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-slate-800">
          <h3 className="font-extrabold text-base mb-6 text-slate-300">Logged Workouts for Date</h3>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-800 rounded-2xl">
              <Dumbbell className="text-slate-600 mb-3" size={32} />
              <p className="text-slate-400 text-sm font-medium">No workouts logged on this date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exercises.map((item: any) => {
                const isNew = item.id === newEntryId;
                return (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-2xl flex items-center justify-between gap-4 transition-all duration-500 ${
                      isNew
                        ? 'bg-green-500/10 border-green-500/30 animate-card-elevate'
                        : 'bg-slate-900/40 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                        isNew
                          ? 'bg-green-500/20 border border-green-500/40 animate-checkbox-spring'
                          : 'bg-orange-500/10 border border-orange-500/20'
                      }`}>
                        {isNew ? <CheckCircle size={20} className="text-green-400" /> : '🏋️'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wide">{item.exerciseType}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.durationMinutes} minutes {item.distanceKm > 0 && `• ${item.distanceKm} km`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-sm font-bold transition-colors duration-300 ${
                          isNew ? 'text-green-400' : 'text-orange-400'
                        }`}>-{item.caloriesBurned} kcal</p>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseTracker;
