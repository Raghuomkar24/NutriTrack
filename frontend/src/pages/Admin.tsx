import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { ShieldAlert, Users, FolderTree, Database, Trash2, Shield, PlusCircle, Check } from 'lucide-react';
import api from '@/api';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'foods'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  // New Food form state
  const [newFood, setNewFood] = useState({
    name: '',
    brand: '',
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    barcode: '',
    servingSize: '100g'
  });

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/api/admin/stats');
      setStats(statsRes.data);

      const usersRes = await api.get('/api/admin/users');
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this user? This action is permanent.");
    if (!confirm) return;

    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      // Reload stats
      const statsRes = await api.get('/api/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    try {
      await api.post('/api/foods', newFood);
      setSuccess('Food catalog item added successfully!');
      setNewFood({
        name: '',
        brand: '',
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        barcode: '',
        servingSize: '100g'
      });
      // Refresh stats
      const statsRes = await api.get('/api/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs">Opening administrator terminal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Admin Console</h2>
          <p className="text-slate-400 text-sm">Restrictive platform operations, user moderation, and seed insertions.</p>
        </div>
      </div>

      {/* Tabs selectors */}
      <div className="flex border-b border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 transition ${activeTab === 'stats' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Overview Statistics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition ${activeTab === 'users' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Manage Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('foods')}
          className={`pb-3 transition ${activeTab === 'foods' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Global Food Catalog
        </button>
      </div>

      {/* Overview Statistics tab */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Registered Accounts</p>
              <p className="text-2xl font-extrabold text-slate-200 mt-1">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl">
              <Database size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Food Catalog Items</p>
              <p className="text-2xl font-extrabold text-slate-200 mt-1">{stats.totalFoods}</p>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl">
              <FolderTree size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Logged Meals</p>
              <p className="text-2xl font-extrabold text-slate-200 mt-1">{stats.totalMeals}</p>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Platform Health</p>
              <p className="text-2xl font-extrabold text-slate-200 mt-1">{stats.platformActiveScore}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Users moderation list */}
      {activeTab === 'users' && (
        <div className="glass rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Goals</th>
                  <th className="px-6 py-4">Roles</th>
                  <th className="px-6 py-4 text-center">Banish / Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-900/20">
                    <td className="px-6 py-4 font-mono">{u.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-100">{u.profile.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.profile.goal || '-'}</td>
                    <td className="px-6 py-4">
                      {u.roles.map((r: string) => (
                        <span key={r} className={`px-2 py-0.5 rounded text-[10px] font-bold ${r === 'ROLE_ADMIN' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                          {r.replace('ROLE_', '')}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insert food catalog items */}
      {activeTab === 'foods' && (
        <div className="max-w-xl glass p-6 rounded-3xl border border-slate-800">
          <h3 className="font-extrabold text-base mb-6 text-slate-300">Insert Global Catalog Food</h3>

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl text-center flex items-center justify-center gap-2">
              <Check size={14} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleAddFood} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Food Name</label>
                <input
                  type="text"
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  placeholder="e.g. Avocado"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Brand / Manufacturer</label>
                <input
                  type="text"
                  value={newFood.brand}
                  onChange={(e) => setNewFood({ ...newFood, brand: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  placeholder="e.g. Generic"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Cal (kcal)</label>
                <input
                  type="number"
                  value={newFood.calories}
                  onChange={(e) => setNewFood({ ...newFood, calories: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Protein (g)</label>
                <input
                  type="number"
                  value={newFood.protein}
                  onChange={(e) => setNewFood({ ...newFood, protein: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Carbs (g)</label>
                <input
                  type="number"
                  value={newFood.carbohydrates}
                  onChange={(e) => setNewFood({ ...newFood, carbohydrates: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Fat (g)</label>
                <input
                  type="number"
                  value={newFood.fat}
                  onChange={(e) => setNewFood({ ...newFood, fat: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Barcode (Unique)</label>
                <input
                  type="text"
                  value={newFood.barcode}
                  onChange={(e) => setNewFood({ ...newFood, barcode: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100 font-mono"
                  placeholder="e.g. 190283002344"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Serving Size</label>
                <input
                  type="text"
                  value={newFood.servingSize}
                  onChange={(e) => setNewFood({ ...newFood, servingSize: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
                  placeholder="e.g. 100g"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 font-bold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <PlusCircle size={16} />
              <span>Add Food to Catalog</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;
