import React, { useState, useEffect } from 'react';
import { ExerciseLog } from '@/types';
import { Dumbbell, Trash2, Calendar, Clock, Flame, CheckCircle } from 'lucide-react';
import api from '@/api';

const ExerciseTracker: React.FC = () => {
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
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

  const handleDelete = async (id: string) => {
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
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Exercise Tracker</h2>
        <p className="text-slate-500 text-sm mt-1 font-semibold">Log daily workouts and calculate active calories burned.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Form */}
        <div className="glass p-6 rounded-3xl border border-white/50 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base mb-6 text-slate-800">Log Workout</h3>

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-150 text-emerald-600 text-xs rounded-xl text-center font-bold">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Log Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-850 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Activity Type</label>
                <select
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-850 font-semibold"
                >
                  <option value="RUNNING" className="bg-white text-slate-800">Running</option>
                  <option value="WALKING" className="bg-white text-slate-800">Walking</option>
                  <option value="GYM" className="bg-white text-slate-800">Gym Session</option>
                  <option value="CYCLING" className="bg-white text-slate-800">Cycling</option>
                  <option value="YOGA" className="bg-white text-slate-800">Yoga / Pilates</option>
                  <option value="SWIMMING" className="bg-white text-slate-800">Swimming</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Duration (Minutes)</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-850 font-bold"
                    required
                  />
                </div>
              </div>

              {['RUNNING', 'WALKING', 'CYCLING', 'SWIMMING'].includes(exerciseType) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Distance (km)</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 text-slate-500 font-bold text-xs pt-0.5">KM</div>
                    <input
                      type="number"
                      step="0.1"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-850 font-bold"
                      placeholder="e.g. 5.2"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Calories Burned (kcal)</label>
                <div className="relative">
                  <Flame className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-850 font-bold"
                    placeholder={`Estimated: ${getEstimatedBurn()} kcal`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-card transition-all duration-200 active:scale-95 ${
                  submitSpring ? 'animate-btn-spring' : ''
                }`}
              >
                Add Workout Log
              </button>
            </form>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-white/50 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base mb-6 text-slate-800">Logged Workouts for Date</h3>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : exercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-300 bg-white/20 rounded-2xl">
                <Dumbbell className="text-slate-400 mb-3" size={32} />
                <p className="text-slate-600 text-sm font-bold">No workouts logged on this date.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {exercises.map((item: ExerciseLog) => {
                  const isNew = item.id === newEntryId;
                  return (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-2xl flex items-center justify-between gap-4 transition-all duration-500 ${
                        isNew
                          ? 'bg-emerald-50 border-emerald-250 animate-card-elevate'
                          : 'bg-white/40 border-white/30 hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isNew
                            ? 'bg-emerald-100 border border-emerald-200 animate-checkbox-spring'
                            : 'bg-primary-100/50 border border-primary-200/50'
                        }`}>
                          {isNew ? <CheckCircle size={20} className="text-emerald-600" /> : '🏋️'}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-850 uppercase tracking-wide">{item.exerciseType}</h4>
                          <p className="text-xs text-slate-500 font-bold mt-0.5">
                            {item.durationMinutes} minutes {item.distanceKm > 0 && `• ${item.distanceKm} km`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className={`text-sm font-extrabold transition-colors duration-305 ${
                            isNew ? 'text-emerald-600' : 'text-primary-655'
                          }`}>-{item.caloriesBurned} kcal</p>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-550 hover:text-primary-650 hover:bg-primary-50/50 rounded-xl transition"
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
    </div>
  );
};

export default ExerciseTracker;
