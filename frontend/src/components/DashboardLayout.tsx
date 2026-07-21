import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, User, Utensils, Droplet, Scale, 
  Dumbbell, MessageSquare, BookOpen, LogOut, Menu, X, Bell, Shield, Map, Leaf
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
  const [toasts, setToasts] = useState<{id: number, msg: string, type: 'info' | 'success'}[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const isAdmin = user.roles && user.roles.includes('ROLE_ADMIN');

  useEffect(() => {
    const handleStorage = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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
        setToasts(prev => [...prev, { id: Date.now(), msg, type: 'info' }]);
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
        setToasts(prev => [...prev, { id: Date.now() + 1, msg: mealMsg, type: 'success' }]);
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
    { name: 'Active Goals', path: '/dashboard/goals', icon: Map },
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
    <div className="min-h-screen bg-gradient-to-b from-[#FFF1E6] to-[#F4F3EE] text-[#463F3A] flex flex-col md:flex-row relative">
      {/* Sidebar for Desktop */}
      <aside className="w-64 glass border-r border-white/40 hidden md:flex flex-col z-10 shadow-sm rounded-none">
        <div className="p-6 border-b border-slate-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-200 text-primary-655 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Leaf className="stroke-[2.5]" size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              NutriTrack Pro
            </h1>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">AI Health Tracker</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{ animationDelay: `${idx * 40}ms` }}
                className={`nav-item-enter flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active 
                    ? 'bg-white/50 text-primary-600 font-bold shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/20'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon size={20} className={`transition-transform duration-200 ${active ? 'scale-115 text-primary-650' : 'group-hover:scale-110'}`} />
                  {active && (
                    <span className="absolute -bottom-1 w-1.5 h-1.5 bg-primary-500 rounded-full shadow-[0_0_8px_#FF9E8A] animate-pulse"></span>
                  )}
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-350 space-y-3">
          <div className="flex items-center gap-3 px-2">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover border border-white/60 shadow-sm flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center font-bold text-white uppercase shadow-md shadow-primary-500/20 flex-shrink-0">
                {user.name ? user.name[0] : 'U'}
              </div>
            )}
            <div className="truncate">
              <p className="text-sm font-semibold truncate text-slate-800">{user.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user.email || 'user@email.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:border-primary-600/30 hover:bg-primary-100/50 text-slate-650 hover:text-primary-600 transition-all duration-200 font-bold active:scale-95"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <header className="md:hidden glass border-b border-slate-300 h-16 flex items-center justify-between px-4 z-20 rounded-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-50 border border-primary-200 text-primary-655 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Leaf className="stroke-[2.5]" size={16} />
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            NutriTrack Pro
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Icon */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl relative hover:bg-white/30"
          >
            <Bell size={20} />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white/30"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="w-64 glass border-r border-slate-300 p-6 flex flex-col relative z-10 animate-slide-in rounded-none">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 pb-6 border-b border-slate-300 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-200 text-primary-655 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Leaf className="stroke-[2.5]" size={20} />
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  NutriTrack Pro
                </h1>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">AI Health Tracker</span>
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      active 
                        ? 'bg-white/50 text-primary-600 font-bold' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/20'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <Icon size={20} className={`transition-transform duration-200 ${active ? 'scale-115 text-primary-650' : 'group-hover:scale-110'}`} />
                      {active && (
                        <span className="absolute -bottom-1 w-1.5 h-1.5 bg-primary-500 rounded-full shadow-[0_0_8px_#FF9E8A]"></span>
                      )}
                    </div>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-300 mt-6 space-y-4">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover border border-white/60 shadow-sm flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center font-bold text-white uppercase flex-shrink-0">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                )}
                <div className="truncate">
                  <p className="text-sm font-semibold truncate text-slate-800">{user.name || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email || 'user@email.com'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:border-primary-600/30 hover:bg-primary-100/50 text-slate-650 hover:text-primary-600 transition-all duration-200 font-semibold active:scale-95"
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
              className="p-2.5 text-slate-600 hover:text-slate-900 bg-white/50 border border-slate-300 rounded-xl relative hover:bg-white/80 shadow-sm transition-all duration-200 active:scale-95"
            >
              <Bell size={20} />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary-500 rounded-full shadow-[0_0_4px_#FF9E8A]"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glass rounded-2xl border border-slate-300 shadow-xl p-4 z-50">
                <div className="flex justify-between items-center pb-2 border-b border-slate-300 mb-3">
                  <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
                  <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline font-bold">Mark all read</button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-2.5 rounded-xl text-xs transition-all ${n.isRead ? 'opacity-60 bg-white/30 text-slate-600' : 'bg-primary-50 border border-primary-200 text-slate-800 font-bold'}`}>
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
      {toasts.map((toast, index) => (
        <Toast 
          key={toast.id}
          index={index}
          message={toast.msg} 
          type={toast.type} 
          onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
        />
      ))}
    </div>
  );
};

export default DashboardLayout;
