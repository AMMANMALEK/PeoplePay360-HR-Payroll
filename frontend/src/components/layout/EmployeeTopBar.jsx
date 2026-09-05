import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmployeeData } from '../../context/EmployeeDataContext';

const PAGE_META = {
  '/employee': { title: 'Dashboard', subtitle: "Here's your work and leave overview." },
  '/employee/profile': { title: 'My Profile', subtitle: 'Your employee record from HR.' },
  '/employee/attendance': { title: 'My Attendance', subtitle: 'Check in, check out, and review your history.' },
  '/employee/time-off': { title: 'Time Off', subtitle: 'Leave balances and requests for yourself only.' },
};

export default function EmployeeTopBar({ onOpenMobileMenu }) {
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useEmployeeData();
  const meta = PAGE_META[location.pathname] || PAGE_META['/employee'];
  const displayName = profile?.fullName || user?.employeeCode || 'Employee';

  return (
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
          <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">{meta.title}</h2>
          <p className="hidden truncate text-xs text-slate-500 sm:block">{meta.subtitle}</p>
        </div>
      </div>
      <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1 pl-1 pr-3 sm:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-200 text-[11px] font-bold text-slate-800">
          EM
        </div>
        <div>
          <p className="text-xs font-semibold leading-tight text-slate-900">{displayName}</p>
          <p className="text-[10px] text-slate-500">{user?.email}</p>
        </div>
      </div>
    </header>
  );
}
