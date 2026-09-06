import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HRDataProvider } from './context/HRDataContext';
import AppShell from './components/layout/AppShell';
import RequireAuth from './components/auth/RequireAuth';
import { ROLES } from './constants/navigation';

import RoleHomeDashboard from './pages/Dashboard/RoleHomeDashboard';
import EmployeesPage from './pages/Employees/EmployeesPage';
import EmployeeDetailPage from './pages/Employees/EmployeeDetailPage';
import AttendancePage from './pages/Attendance/AttendancePage';
import ContractsPage from './pages/Contracts/ContractsPage';
import SchedulesPage from './pages/Schedules/SchedulesPage';
import TimeOffPage from './pages/TimeOff/TimeOffPage';
import EmployeeShell from './components/layout/EmployeeShell';
import LoginPage from './pages/Login/LoginPage';
import EmployeeDashboardPage from './pages/Employee/EmployeeDashboardPage';
import EmployeeProfilePage from './pages/Employee/EmployeeProfilePage';
import EmployeeAttendancePage from './pages/Employee/EmployeeAttendancePage';
import EmployeeTimeOffPage from './pages/Employee/EmployeeTimeOffPage';

// Admin Pages
import AdminOverviewPage from './pages/Admin/AdminOverviewPage';
import DepartmentManagementPage from './pages/Admin/DepartmentManagementPage';
import HRGovernancePage from './pages/Admin/HRGovernancePage';
import UsersPage from './pages/Admin/UsersPage';
import RolesPermissionsPage from './pages/Admin/RolesPermissionsPage';
import SystemAdminPage from './pages/Admin/SystemAdminPage';
import AuditLogPage from './pages/Admin/AuditLogPage';

// Payroll Pages
import PayrollPage from './pages/Payroll/PayrollPage';
import PayrollDashboardPage from './pages/Payroll/PayrollDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Employee Routes */}
          <Route
            path="/employee"
            element={
              <RequireAuth roles={[ROLES.EMPLOYEE]}>
                <EmployeeShell />
              </RequireAuth>
            }
          >
            <Route index element={<EmployeeDashboardPage />} />
            <Route path="profile" element={<EmployeeProfilePage />} />
            <Route path="attendance" element={<EmployeeAttendancePage />} />
            <Route path="time-off" element={<EmployeeTimeOffPage />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RequireAuth roles={[ROLES.ADMIN]}>
                <HRDataProvider>
                  <AppShell />
                </HRDataProvider>
              </RequireAuth>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="departments" element={<DepartmentManagementPage />} />
            <Route path="hr-governance" element={<HRGovernancePage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPermissionsPage />} />
            <Route path="system" element={<SystemAdminPage />} />
            <Route path="audit" element={<AuditLogPage />} />
          </Route>

          {/* Main App Workspace Routes: HR Manager, Payroll Manager, Payroll User, Admin */}
          <Route
            path="/"
            element={
              <RequireAuth roles={[ROLES.HR_MANAGER, ROLES.HR_PAYROLL_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.ADMIN]}>
                <HRDataProvider>
                  <AppShell />
                </HRDataProvider>
              </RequireAuth>
            }
          >
            <Route index element={<RoleHomeDashboard />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/:id" element={<EmployeeDetailPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="schedules" element={<SchedulesPage />} />
            <Route path="time-off" element={<TimeOffPage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="payroll/dashboard" element={<PayrollDashboardPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
