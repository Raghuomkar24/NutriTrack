import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userString);
  const userRoles: string[] = user.roles || [];

  if (allowedRoles && !allowedRoles.some(role => userRoles.includes(role))) {
    // If user does not have permission, redirect to dashboard home
    return <Navigate to="/dashboard/home" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
