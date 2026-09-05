import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HRDataProvider } from './context/HRDataContext';
import AppShell from './components/layout/AppShell';

// Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import EmployeesPage from './pages/Employees/EmployeesPage';
import EmployeeDetailPage from './pages/Employees/EmployeeDetailPage';
import AttendancePage from './pages/Attendance/AttendancePage';
import ContractsPage from './pages/Contracts/ContractsPage';
import SchedulesPage from './pages/Schedules/SchedulesPage';
import TimeOffPage from './pages/TimeOff/TimeOffPage';
import ReportsPage from './pages/Reports/ReportsPage';

export default function App() {
  return (
    <HRDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/:id" element={<EmployeeDetailPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="schedules" element={<SchedulesPage />} />
            <Route path="time-off" element={<TimeOffPage />} />
            <Route path="reports" element={<ReportsPage />} />
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HRDataProvider>
  );
}
