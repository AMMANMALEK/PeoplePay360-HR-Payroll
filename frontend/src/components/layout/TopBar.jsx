import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import { APP_ROLE, ADMIN_APP_ROLE, ROLES } from '../../constants/navigation';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { getGreeting, getHRDisplayName } from '../../utils/greeting';
import GlobalSearchModal from './GlobalSearchModal';
import { Link } from 'react-router-dom';

const PAGE_META = {
  '/admin': { title: 'Admin Overview', subtitle: 'Platform administration overview and access governance.' },
  '/admin/departments': { title: 'Departments & Positions', subtitle: 'Manage organizational departments and job positions.' },
  '/admin/hr-governance': { title: 'HR Leadership Governance', subtitle: 'Approve HR Manager leaves & adjust check-in/out timings.' },
  '/admin/users': { title: 'User Management', subtitle: 'Manage platform accounts, status, and role assignments.' },
  '/admin/roles': { title: 'Roles & Permissions', subtitle: 'RBAC definitions and granular system permissions.' },
  '/admin/system': { title: 'System Status', subtitle: 'Platform health, database status, and operational uptime.' },
  '/admin/audit': { title: 'Audit Logs', subtitle: 'Administrative actions, security changes, and system trail.' },
  '/': { title: 'Dashboard', subtitle: 'Workforce snapshot and items that need a decision today.' },
  '/employees': { title: 'Employees', subtitle: 'Directory, profiles, and employment records.' },
  '/attendance': { title: 'Attendance', subtitle: 'Daily presence, exceptions, and corrections.' },
  '/contracts': { title: 'Contracts', subtitle: 'Active terms, renewals, and contract history.' },
  '/schedules': { title: 'Working Schedules', subtitle: 'Shift patterns and weekly working hours.' },
  '/time-off': { title: 'Time Off', subtitle: 'Leave requests, balances, and approval decisions.' },
  '/payroll': { title: 'Payroll', subtitle: 'Payruns, payslips, salary structures, and rules.' },
  '/payroll/dashboard': { title: 'Payroll Dashboard', subtitle: 'Payroll operations, disbursement, and workflow status.' },
};

export default function TopBar({ onOpenMobileMenu }) {
  const location = useLocation();
  const { attentionItems, employees } = useHRData();
  const { user, isAdmin } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isAdministrator = isAdmin || user?.role === ROLES.ADMIN;
  const greeting = getGreeting();
  const hrDisplayName = getHRDisplayName(user, employees);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const basePath = `/${location.pathname.split('/').filter(Boolean)[0] || ''}`;
  const payrollHomeMeta = {
    title: user?.role === ROLES.HR_PAYROLL_MANAGER ? 'Payroll Manager Dashboard' : 'Payroll User Dashboard',
    subtitle:
      user?.role === ROLES.HR_PAYROLL_MANAGER
        ? 'Full HR and payroll command: payruns, payslips, structures, and rules.'
        : 'HR plus payrun and payslip create/read/update. Salary structures and rules are read-only.',
  };
  const meta =
    location.pathname === '/' && (user?.role === ROLES.HR_PAYROLL_MANAGER || user?.role === ROLES.HR_PAYROLL_USER)
      ? payrollHomeMeta
      : PAGE_META[location.pathname] || PAGE_META[basePath] || PAGE_META['/'];
  const isDetail = location.pathname.startsWith('/employees/') && location.pathname !== '/employees';

  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-[72px] w-full shrink-0 items-center justify-between gap-4 border-b border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">
              {isDetail ? 'Employee profile' : meta.title}
            </h2>
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              {isDetail ? 'View linked attendance, contracts, and time off.' : meta.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400 hover:border-slate-300 hover:bg-white hover:text-slate-600"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline-block">
              ⌘K
            </kbd>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label="View attention notifications"
            >
              <Bell className="h-4 w-4" />
              {attentionItems.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-400 px-1 text-[10px] font-bold text-slate-900">
                  {attentionItems.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 z-40 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-dropdown">
                <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-semibold text-slate-900">Notifications</span>
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    {attentionItems.length}
                  </span>
                </div>
                <div className="max-h-72 space-y-1.5 overflow-y-auto">
                  {attentionItems.length === 0 ? (
                    <p className="p-2.5 text-[11px] text-slate-500">No pending HR actions.</p>
                  ) : (
                    attentionItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.targetRoute}
                        onClick={() => setShowNotifications(false)}
                        className="block rounded-xl border border-slate-100 bg-slate-50 p-2.5 hover:bg-brand-50"
                      >
                        <div className="text-xs font-semibold text-slate-900">{item.badgeText}</div>
                        <div className="mt-0.5 text-[11px] text-slate-600">{item.title}</div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1 pl-1 pr-3 lg:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-200 text-[11px] font-bold text-slate-800">
              {isAdministrator
                ? 'AD'
                : user?.role === ROLES.HR_PAYROLL_USER
                ? 'PU'
                : user?.role === ROLES.HR_PAYROLL_MANAGER
                ? 'PM'
                : 'HR'}
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight text-slate-900">
                {hrDisplayName}
              </p>
              <p className="text-[10px] text-slate-500">
                {isAdministrator
                  ? ADMIN_APP_ROLE.name
                  : user?.role === ROLES.HR_PAYROLL_MANAGER
                  ? 'Payroll Manager'
                  : user?.role === ROLES.HR_PAYROLL_USER
                  ? 'Payroll User'
                  : APP_ROLE.name}
              </p>
            </div>
          </div>
        </div>
      </header>
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
