import React from 'react';
import EmptyState from '../ui/EmptyState';
import { useEmployeeData } from '../../context/EmployeeDataContext';

export default function LeaveBalanceSection({ compact = false }) {
  const {
    currentPersonalLeave,
    currentSickLeave,
    currentFestivalLeave,
    pendingCount,
    isLoading,
  } = useEmployeeData();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading leave balances…</p>;
  }

  // Fallback objects if allocation has not yet synced
  const personal = currentPersonalLeave || {
    allocated: 15,
    taken: 0,
    remaining: 15,
    validity: `${new Date().getFullYear()}-12-31`,
  };

  const sick = currentSickLeave || {
    allocated: 10,
    taken: 0,
    remaining: 10,
    validity: `${new Date().getFullYear()}-08-31`,
  };

  const festival = currentFestivalLeave || {
    allocated: 5,
    taken: 0,
    remaining: 5,
    validity: `${new Date().getFullYear()}-12-31`,
  };

  const cards = [
    {
      title: 'Personal Leave',
      badge: 'Auto-approved',
      badgeClass: 'bg-emerald-50 text-emerald-700',
      validity: `Validity until ${personal.validity || `${new Date().getFullYear()}-12-31`}`,
      data: personal,
      accent: 'border-emerald-100',
    },
    {
      title: 'Sick Leave',
      badge: 'March – August',
      badgeClass: 'bg-amber-50 text-amber-700',
      validity: 'March to August (2 quarters window)',
      data: sick,
      accent: 'border-amber-100',
    },
    {
      title: 'Festival Leave',
      badge: 'Festival & Holidays',
      badgeClass: 'bg-violet-50 text-violet-700',
      validity: `Validity until ${festival.validity || `${new Date().getFullYear()}-12-31`}`,
      data: festival,
      accent: 'border-violet-100',
    },
  ];

  return (
    <div
      className={`grid gap-4 ${
        compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      }`}
    >
      {cards.map((c) => (
        <div
          key={c.title}
          className={`rounded-[18px] border bg-white p-5 shadow-card transition-shadow hover:shadow-md ${c.accent}`}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${c.badgeClass}`}
            >
              {c.badge}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{c.validity}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-900">{c.data.allocated} days</p>
            <span className="text-xs text-slate-500">Allowance</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
            <div className="rounded-lg bg-slate-50/70 py-1.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Used</p>
              <p className="mt-0.5 text-sm font-bold text-amber-600">{c.data.taken} d</p>
            </div>
            <div className="rounded-lg bg-slate-50/70 py-1.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Remaining</p>
              <p className="mt-0.5 text-sm font-bold text-emerald-600">{c.data.remaining} d</p>
            </div>
            <div className="rounded-lg bg-slate-50/70 py-1.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Pending</p>
              <p className="mt-0.5 text-sm font-bold text-slate-700">
                {c.title === 'Personal Leave' ? pendingCount : 0}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
