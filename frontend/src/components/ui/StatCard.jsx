import React from 'react';
import {
  Users,
  UserCheck,
  CalendarClock,
  FileText,
  AlertCircle,
  Activity,
} from 'lucide-react';

const ICON_MAP = {
  users: Users,
  present: UserCheck,
  calendar: CalendarClock,
  contract: FileText,
  alert: AlertCircle,
  health: Activity,
};

const PASTELS = {
  lime: 'bg-[#eef8d8] text-slate-800',
  mint: 'bg-[#e4f4ea] text-emerald-900',
  peach: 'bg-[#fde9d8] text-amber-900',
  sky: 'bg-[#e4eefc] text-sky-900',
  rose: 'bg-[#fce8e8] text-rose-900',
  lilac: 'bg-[#eee8fb] text-violet-900',
};

export default function StatCard({
  title,
  value,
  secondaryValue,
  subtext,
  icon = 'users',
  colorScheme = 'lime',
  onClick,
  className = '',
}) {
  const IconComponent = ICON_MAP[icon] || Users;
  const pastel = PASTELS[colorScheme] || PASTELS.lime;

  return (
    <div
      role={onClick ? 'button' : 'region'}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`rounded-[18px] p-5 transition-transform ${pastel} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70">
          <IconComponent className="h-4.5 w-4.5 h-5 w-5" />
        </div>
      </div>
      <p className="mt-5 text-xs font-medium text-slate-600">{title}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        {secondaryValue && (
          <span className="text-xs font-medium text-slate-600">{secondaryValue}</span>
        )}
      </div>
      {subtext && <p className="mt-2 text-[11px] text-slate-500">{subtext}</p>}
    </div>
  );
}
