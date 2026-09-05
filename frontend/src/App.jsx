import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HRDataProvider } from './context/HRDataContext';
import AppShell from './components/layout/AppShell';
import RequireAuth from './components/auth/RequireAuth';
import { ROLES } from './constants/navigation';

<<<<<<< HEAD
=======
// Auth Page
import LoginPage from './pages/Auth/LoginPage';

// HR Manager Pages
>>>>>>> 3035e89c7acb4b8ccf2f83eb29ddd1bd13812d82
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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
<<<<<<< HEAD
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
=======
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Main App Layout */}
          <Route path="/" element={<AppShell />}>
            {/* Core HR Routes */}
>>>>>>> 3035e89c7acb4b8ccf2f83eb29ddd1bd13812d82
            <Route index element={<DashboardPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/:id" element={<EmployeeDetailPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="schedules" element={<SchedulesPage />} />
            <Route path="time-off" element={<TimeOffPage />} />
<<<<<<< HEAD
=======
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
>>>>>>> 3035e89c7acb4b8ccf2f83eb29ddd1bd13812d82
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
