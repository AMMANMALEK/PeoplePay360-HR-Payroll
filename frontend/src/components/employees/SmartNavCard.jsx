import React from 'react';
import { FileText, Clock, CalendarCheck, PieChart, ArrowRight } from 'lucide-react';

const ICONS = {
  contracts: FileText,
  attendance: Clock,
  timeoff: CalendarCheck,
  allocations: PieChart
};

export default function SmartNavCard({
  type,
  label,
  primaryValue,
  secondaryValue,
  isActive,
  onClick
}) {
  const Icon = ICONS[type] || FileText;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-1 flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer ${
        isActive
          ? 'border-brand-400 bg-brand-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/80 shadow-subtle hover:-translate-y-0.5'
      }`}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            isActive ? 'bg-brand-400 text-slate-900 shadow-sm' : 'bg-slate-100 text-slate-600 group-hover:bg-brand-100 group-hover:text-slate-800'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-lg font-bold text-slate-900 tracking-tight">
          {primaryValue}
        </div>
        {secondaryValue && (
          <div className="mt-0.5 text-xs font-semibold text-brand-700">
            {secondaryValue}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100/80 pt-2 text-[11px] font-medium text-slate-500">
        <span className={isActive ? 'text-brand-800 font-semibold' : 'group-hover:text-slate-700'}>
          {isActive ? 'Active View' : 'Click to inspect'}
        </span>
        <ArrowRight className={`h-3 w-3 transition-transform ${isActive ? 'text-brand-700' : 'text-slate-400 group-hover:translate-x-0.5 group-hover:text-brand-700'}`} />
      </div>
    </button>
  );
}
