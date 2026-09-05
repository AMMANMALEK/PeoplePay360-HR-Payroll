import React from 'react';
import { useEmployeeData } from '../../context/EmployeeDataContext';

export default function LeaveBalanceSection() {
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

  // Configured allowances from admin
  const configuredAllowances = (() => {
    try {
      const saved = localStorage.getItem('peoplepay_fixed_leaves');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { 'Personal Leave': 15, 'Sick Leave': 10, 'Festival Leave': 5 };
  })();

  const personalAlloc = currentPersonalLeave?.allocated ?? (configuredAllowances['Personal Leave'] || 15);
  const personalTaken = currentPersonalLeave?.taken || 0;
  const personal = {
    allocated: personalAlloc,
    taken: personalTaken,
    remaining: currentPersonalLeave ? currentPersonalLeave.remaining : Math.max(0, personalAlloc - personalTaken),
    validity: currentPersonalLeave?.validity || `${new Date().getFullYear()}-12-31`,
  };

  const sickAlloc = currentSickLeave?.allocated ?? (configuredAllowances['Sick Leave'] || 10);
  const sickTaken = currentSickLeave?.taken || 0;
  const sick = {
    allocated: sickAlloc,
    taken: sickTaken,
    remaining: currentSickLeave ? currentSickLeave.remaining : Math.max(0, sickAlloc - sickTaken),
    validity: currentSickLeave?.validity || `${new Date().getFullYear()}-08-31`,
  };

  const festivalAlloc = currentFestivalLeave?.allocated ?? (configuredAllowances['Festival Leave'] || 5);
  const festivalTaken = currentFestivalLeave?.taken || 0;
  const festival = {
    allocated: festivalAlloc,
    taken: festivalTaken,
    remaining: currentFestivalLeave ? currentFestivalLeave.remaining : Math.max(0, festivalAlloc - festivalTaken),
    validity: currentFestivalLeave?.validity || `${new Date().getFullYear()}-12-31`,
  };

  const cards = [
    {
      title: 'Personal Leave',
      badge: 'Auto-approved',
      badgeClass: 'bg-white/90 text-emerald-800 border border-emerald-200/70',
      validity: `Valid until ${personal.validity || `${new Date().getFullYear()}-12-31`}`,
      data: personal,
      bgClass: 'bg-[#e4f4ea] border-emerald-200/90 text-emerald-950',
      statBoxClass: 'bg-white/90 border-emerald-100',
    },
    {
      title: 'Sick Leave',
      badge: 'March – August',
      badgeClass: 'bg-white/90 text-amber-800 border border-amber-200/70',
      validity: 'March to August (2 quarters window)',
      data: sick,
      bgClass: 'bg-[#fde9d8] border-amber-200/90 text-amber-950',
      statBoxClass: 'bg-white/90 border-amber-100',
    },
    {
      title: 'Festival Leave',
      badge: 'Festival & Holidays',
      badgeClass: 'bg-white/90 text-violet-800 border border-violet-200/70',
      validity: `Valid until ${festival.validity || `${new Date().getFullYear()}-12-31`}`,
      data: festival,
      bgClass: 'bg-[#eee8fb] border-violet-200/90 text-violet-950',
      statBoxClass: 'bg-white/90 border-violet-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.title}
          className={`flex flex-col justify-between rounded-[20px] border p-4 sm:p-5 shadow-xs transition-all hover:shadow-md ${c.bgClass}`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold tracking-tight text-slate-900">{c.title}</h4>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.badgeClass}`}
              >
                {c.badge}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">{c.validity}</p>

            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {c.data.allocated} days
              </p>
              <span className="text-[11px] font-semibold text-slate-600">Allowance</span>
            </div>
          </div>

          <div className="mt-3.5 grid grid-cols-3 gap-1.5 border-t border-black/5 pt-3 text-center">
            <div className={`rounded-xl py-1.5 shadow-xs border ${c.statBoxClass}`}>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Used</p>
              <p className="mt-0.5 text-xs font-extrabold text-amber-600 sm:text-sm">{c.data.taken} d</p>
            </div>
            <div className={`rounded-xl py-1.5 shadow-xs border ${c.statBoxClass}`}>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Remaining</p>
              <p className="mt-0.5 text-xs font-extrabold text-emerald-600 sm:text-sm">{c.data.remaining} d</p>
            </div>
            <div className={`rounded-xl py-1.5 shadow-xs border ${c.statBoxClass}`}>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pending</p>
              <p className="mt-0.5 text-xs font-extrabold text-slate-700 sm:text-sm">
                {c.title === 'Personal Leave' ? pendingCount : 0}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
