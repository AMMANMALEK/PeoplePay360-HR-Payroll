import React from 'react';
import EmptyState from '../ui/EmptyState';
import { useEmployeeData } from '../../context/EmployeeDataContext';

export default function LeaveBalanceSection({ compact = false }) {
  const { currentPersonalLeave, pendingCount, isLoading } = useEmployeeData();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading leave balances…</p>;
  }

  if (!currentPersonalLeave) {
    return (
      <EmptyState
        title="No leave balances"
        description="Your Personal Leave allocation is not available yet."
        className="border-0 shadow-none"
      />
    );
  }

  return (
    <div className={`grid gap-4 ${compact ? 'md:grid-cols-1' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
      <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-card">
        <h4 className="text-sm font-bold text-slate-900">Personal Leave</h4>
        <p className="mt-1 text-[11px] text-slate-400">
          Validity until {currentPersonalLeave.validity || '—'}
        </p>
        <p className="mt-4 text-3xl font-semibold text-slate-900">
          {currentPersonalLeave.allocated} days
        </p>
        <p className="text-xs text-slate-500">Annual Allowance</p>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
          <div>
            <p className="text-[10px] uppercase text-slate-400">Used</p>
            <p className="text-sm font-bold text-amber-600">{currentPersonalLeave.taken} days</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-400">Remaining</p>
            <p className="text-sm font-bold text-emerald-600">{currentPersonalLeave.remaining} days</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-400">Pending</p>
            <p className="text-sm font-bold text-slate-700">{pendingCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
