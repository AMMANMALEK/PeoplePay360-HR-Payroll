import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { ROLES } from '../constants/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    authService
      .me()
      .then((response) => {
        if (mounted) setUser(response.data || null);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.data);
    return response.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === ROLES.ADMIN,
        isHrManager: user?.role === ROLES.HR_MANAGER,
        isPayrollManager: user?.role === ROLES.HR_PAYROLL_MANAGER,
        isPayrollUser: user?.role === ROLES.HR_PAYROLL_USER,
        isPayroll: user?.role === ROLES.HR_PAYROLL_MANAGER || user?.role === ROLES.HR_PAYROLL_USER,
        isEmployee: user?.role === ROLES.EMPLOYEE,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
