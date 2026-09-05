import React from 'react';

export default function AllocationCard({ allocation }) {
  const percentTaken = Math.min(100, Math.round((allocation.taken / (allocation.allocated || 1)) * 100));

  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900">{allocation.typeName}</h4>
          <p className="text-[11px] text-slate-400">Validity until {allocation.validity}</p>
        </div>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-brand-100">
          {allocation.status}
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2 border-y border-slate-100 py-2.5 text-center">
        <div>
          <span className="text-[10px] font-medium text-slate-400 uppercase">Allocated</span>
          <div className="text-sm font-bold text-slate-700">{allocation.allocated}d</div>
        </div>
        <div>
          <span className="text-[10px] font-medium text-slate-400 uppercase">Taken</span>
          <div className="text-sm font-bold text-amber-600">{allocation.taken}d</div>
        </div>
        <div>
          <span className="text-[10px] font-medium text-slate-400 uppercase">Remaining</span>
          <div className="text-sm font-bold text-emerald-600">{allocation.remaining}d</div>
        </div>
      </div>

      {/* Consumption Progress Bar */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>Usage: {percentTaken}%</span>
          <span>{allocation.remaining} days left</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              percentTaken > 80 ? 'bg-amber-500' : 'bg-brand-400'
            }`}
            style={{ width: `${percentTaken}%` }}
          />
        </div>
      </div>
    </div>
  );
}
