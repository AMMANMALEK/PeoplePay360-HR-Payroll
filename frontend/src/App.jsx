import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HRDataProvider } from './context/HRDataContext';
import AppShell from './components/layout/AppShell';
import RequireAuth from './components/auth/RequireAuth';
import { ROLES } from './constants/navigation';

import DashboardPage from './pages/Dashboard/DashboardPage';
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
          <Route
            path="/"
            element={
              <RequireAuth roles={[ROLES.HR_MANAGER]}>
                <HRDataProvider>
                  <AppShell />
                </HRDataProvider>
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/:id" element={<EmployeeDetailPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="schedules" element={<SchedulesPage />} />
            <Route path="time-off" element={<TimeOffPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
