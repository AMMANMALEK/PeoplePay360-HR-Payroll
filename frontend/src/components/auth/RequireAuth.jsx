import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/navigation';

export default function RequireAuth({ children, roles }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-slate-500">
        Checking session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    if (user.role === ROLES.ADMIN) {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === ROLES.EMPLOYEE) {
      return <Navigate to="/employee" replace />;
    }
    if (user.role === ROLES.HR_PAYROLL_MANAGER || user.role === ROLES.HR_PAYROLL_USER) {
      return <Navigate to="/payroll" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
