import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Dashboard Pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import LogMeal from './pages/LogMeal';
import Analytics from './pages/Analytics';
import WaterTracker from './pages/WaterTracker';
import WeightTracker from './pages/WeightTracker';
import ExerciseTracker from './pages/ExerciseTracker';
import AiCoach from './pages/AiCoach';
import Recipes from './pages/Recipes';
import Admin from './pages/Admin';
import Goals from './pages/Goals';
import Reports from './pages/Reports';

const App: React.FC = () => {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference') || 'sunset';
    document.documentElement.classList.remove('theme-sunset', 'theme-ocean', 'theme-forest');
    document.documentElement.classList.add(`theme-${savedTheme}`);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Dashboard Layout Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="home" element={<Home />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="log-meal" element={<LogMeal />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="water" element={<WaterTracker />} />
                  <Route path="weight" element={<WeightTracker />} />
                  <Route path="exercise" element={<ExerciseTracker />} />
                  <Route path="ai-coach" element={<AiCoach />} />
                  <Route path="recipes" element={<Recipes />} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="reports" element={<Reports />} />
                  
                  {/* Admin Route restricted to ROLE_ADMIN */}
                  <Route 
                    path="admin" 
                    element={
                      <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <Admin />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Fallback to Dashboard Home */}
                  <Route path="*" element={<Navigate to="home" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
