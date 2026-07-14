import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, User, Utensils, Droplet, Scale, 
  Dumbbell, MessageSquare, BookOpen, LogOut, Menu, X, Bell, Shield 
} from 'lucide-react';
import api from '../api';
import Toast from './Toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastMessage, setToastMessage] = useState<{msg: string, type: 'info' | 'success'} | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.roles && user.roles.includes('ROLE_ADMIN');

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/api/notifications');
        // If the notifications API is not fully set up or seeded yet, use a mock list
        setNotifications(res.data && res.data.length > 0 ? res.data : [
          { id: 1, message: "Welcome to NutriTrack Pro! Keep up your healthy habits.", isRead: false }
        ]);
      } catch (err) {
        setNotifications([
          { id: 1, message: "Welcome to NutriTrack Pro! Keep up your healthy habits.", isRead: false }
        ]);
      }
    };
    fetchNotifications();

    const checkReminders = () => {
      const now = new Date();
      const hours = now.getHours();
      const timeKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${hours}`;

      const lastWaterReminder = localStorage.getItem('lastWaterReminder');
      const lastFoodReminder = localStorage.getItem('lastFoodReminder');

      // Drink water reminder (e.g., every 2 hours from 8 AM to 8 PM)
      if (hours >= 8 && hours <= 20 && hours % 2 === 0 && lastWaterReminder !== timeKey) {
        const msg = "Time to hydrate! Drink a glass of water. 💧";
        setNotifications(prev => [{ id: Date.now(), message: msg, isRead: false }, ...prev]);
        localStorage.setItem('lastWaterReminder', timeKey);
        setShowNotifications(true);
        setToastMessage({ msg, type: 'info' });
      }

      // Eat food reminders (Breakfast: 8 AM, Lunch: 1 PM, Dinner: 7 PM)
      let mealMsg = null;
      if (hours === 8 && lastFoodReminder !== `breakfast-${timeKey}`) {
        mealMsg = "Time for Breakfast! Start your day with a healthy meal. 🍳";
        localStorage.setItem('lastFoodReminder', `breakfast-${timeKey}`);
      } else if (hours === 13 && lastFoodReminder !== `lunch-${timeKey}`) {
        mealMsg = "Time for Lunch! Fuel your afternoon. 🥗";
        localStorage.setItem('lastFoodReminder', `lunch-${timeKey}`);
      } else if (hours === 19 && lastFoodReminder !== `dinner-${timeKey}`) {
        mealMsg = "Time for Dinner! Keep it light and healthy. 🍲";
        localStorage.setItem('lastFoodReminder', `dinner-${timeKey}`);
      }

      if (mealMsg) {
        setNotifications(prev => [{ id: Date.now() + 1, message: mealMsg, isRead: false }, ...prev]);
        setShowNotifications(true);
        setToastMessage({ msg: mealMsg, type: 'success' });
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard/home', icon: LayoutDashboard },
    { name: 'Profile', path: '/dashboard/profile', icon: User },
    { name: 'Log Meals', path: '/dashboard/log-meal', icon: Utensils },
    { name: 'Water Tracker', path: '/dashboard/water', icon: Droplet },
    { name: 'Weight Tracker', path: '/dashboard/weight', icon: Scale },
    { name: 'Exercise', path: '/dashboard/exercise', icon: Dumbbell },
    { name: 'AI Coach', path: '/dashboard/ai-coach', icon: MessageSquare },
    { name: 'Recipes & Groceries', path: '/dashboard/recipes', icon: BookOpen },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', path: '/dashboard/admin', icon: Shield });
  }

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col md:flex-row relative">
      {/* Background glow elements */}
      <div className="glow-spot-green top-10 left-10"></div>
      <div className="glow-spot-orange bottom-10 right-10"></div>

      {/* Sidebar for Desktop */}
      <aside className="w-64 glass hidden md:flex flex-col border-r border-slate-800 z-10">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <span className="text-3xl">🥑</span>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              NutriTrack Pro
            </h1>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">AI Health Tracker</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active 
                    ? 'bg-primary-500 text-white font-medium shadow-glass shadow-green-500/20' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 flex items-center justify-center font-bold text-white uppercase shadow-md shadow-green-500/20">
              {user.name ? user.name[0] : 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold truncate">{user.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user.email || 'user@email.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <header className="md:hidden glass border-b border-slate-800 h-16 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥑</span>
          <span className="font-extrabold text-lg bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            NutriTrack Pro
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Icon */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-xl relative hover:bg-slate-800"
          >
            <Bell size={20} />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col relative z-10 animate-slide-in">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-850"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
              <span className="text-3xl">🥑</span>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  NutriTrack Pro
                </h1>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">AI Health Tracker</span>
              </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active 
                        ? 'bg-primary-500 text-white font-medium' 
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-800 mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 flex items-center justify-center font-bold text-white uppercase">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold truncate">{user.name || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email || 'user@email.com'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-200"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-4rem)] md:h-screen relative z-10">
        {/* Desktop Header bar (Notification panel trigger) */}
        <div className="hidden md:flex justify-end items-center mb-6 gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 text-slate-400 hover:text-slate-100 glass rounded-xl relative hover:bg-slate-800/50 transition-all duration-200"
            >
              <Bell size={20} />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glass rounded-2xl border border-slate-800 shadow-2xl p-4 z-50">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  <button onClick={markAllRead} className="text-xs text-primary-500 hover:underline">Mark all read</button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-2.5 rounded-xl text-xs transition-all ${n.isRead ? 'opacity-60 bg-slate-800/20' : 'bg-primary-500/10 border border-primary-500/20 text-slate-200'}`}>
                      <p>{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic page content */}
        {children}
      </main>

      {/* Global Reminders Toast */}
      {toastMessage && (
        <Toast 
          message={toastMessage.msg} 
          type={toastMessage.type} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </div>
  );
};

export default DashboardLayout;
