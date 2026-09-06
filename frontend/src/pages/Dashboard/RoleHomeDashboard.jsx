import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardPage from './DashboardPage';
import HRPayrollManagerDashboardPage from '../Payroll/HRPayrollManagerDashboardPage';
import HRPayrollUserDashboardPage from '../Payroll/HRPayrollUserDashboardPage';
import { ROLES } from '../../constants/navigation';

export default function RoleHomeDashboard() {
  const { user } = useAuth();

  if (user?.role === ROLES.HR_PAYROLL_MANAGER) {
    return <HRPayrollManagerDashboardPage />;
  }

  if (user?.role === ROLES.HR_PAYROLL_USER) {
    return <HRPayrollUserDashboardPage />;
  }

  return <DashboardPage />;
}
