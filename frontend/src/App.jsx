import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HRDataProvider } from './context/HRDataContext';
import AppShell from './components/layout/AppShell';

// Auth Page
import LoginPage from './pages/Auth/LoginPage';

// HR Manager Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import EmployeesPage from './pages/Employees/EmployeesPage';
import EmployeeDetailPage from './pages/Employees/EmployeeDetailPage';
import AttendancePage from './pages/Attendance/AttendancePage';
import ContractsPage from './pages/Contracts/ContractsPage';
import SchedulesPage from './pages/Schedules/SchedulesPage';
import TimeOffPage from './pages/TimeOff/TimeOffPage';
import ReportsPage from './pages/Reports/ReportsPage';

// HR Payroll User Workspace Pages
import PayrollDashboardPage from './pages/Payroll/PayrollDashboardPage';
import PayrunListPage from './pages/Payroll/PayrunListPage';
import PayrunProcessingPage from './pages/Payroll/PayrunProcessingPage';
import PayslipListPage from './pages/Payroll/PayslipListPage';
import PayslipDetailPage from './pages/Payroll/PayslipDetailPage';
import SalaryStructureListPage from './pages/Payroll/SalaryStructureListPage';
import SalaryStructureDetailPage from './pages/Payroll/SalaryStructureDetailPage';
import SalaryRuleListPage from './pages/Payroll/SalaryRuleListPage';

export default function App() {
  return (
    <HRDataProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Main App Layout */}
          <Route path="/" element={<AppShell />}>
            {/* Core HR Routes */}
            <Route index element={<DashboardPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/:id" element={<EmployeeDetailPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="schedules" element={<SchedulesPage />} />
            <Route path="time-off" element={<TimeOffPage />} />
            <Route path="reports" element={<ReportsPage />} />

            {/* HR Payroll User Workspace Routes */}
            <Route path="payroll" element={<Navigate to="/payroll/dashboard" replace />} />
            <Route path="payroll/dashboard" element={<PayrollDashboardPage />} />
            <Route path="payroll/payruns" element={<PayrunListPage />} />
            <Route path="payroll/payruns/:id" element={<PayrunProcessingPage />} />
            <Route path="payroll/payslips" element={<PayslipListPage />} />
            <Route path="payroll/payslips/:id" element={<PayslipDetailPage />} />
            <Route path="payroll/salary-structures" element={<SalaryStructureListPage />} />
            <Route path="payroll/salary-structures/:id" element={<SalaryStructureDetailPage />} />
            <Route path="payroll/salary-rules" element={<SalaryRuleListPage />} />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HRDataProvider>
  );
}
