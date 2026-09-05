import React from 'react';
import { 
  Users, 
  UserCheck, 
  CalendarClock, 
  FileText, 
  AlertCircle, 
  ArrowUpRight,
  Activity
} from 'lucide-react';

const ICON_MAP = {
  users: Users,
  present: UserCheck,
  calendar: CalendarClock,
  contract: FileText,
  alert: AlertCircle,
  health: Activity
};

export default function StatCard({
  title,
  value,
  secondaryValue,
  subtext,
  icon = 'users',
  trend,
  colorScheme = 'indigo',
  onClick,
  className = ''
}) {
  const IconComponent = ICON_MAP[icon] || Users;

  const colorVariants = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      borderHover: 'hover:border-indigo-300'
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      borderHover: 'hover:border-emerald-300'
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      borderHover: 'hover:border-amber-300'
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      borderHover: 'hover:border-rose-300'
    },
    sky: {
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
      borderHover: 'hover:border-sky-300'
    }
  };

  const scheme = colorVariants[colorScheme] || colorVariants.indigo;

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
      className={`group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-subtle transition-all duration-200 ${
        onClick ? `cursor-pointer ${scheme.borderHover} hover:shadow-hover hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500` : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {title}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${scheme.iconBg}`}>
          <IconComponent className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {secondaryValue && (
          <span className="text-sm font-medium text-slate-500">
            {secondaryValue}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
        <span className="truncate">{subtext}</span>
        {onClick && (
          <span className="inline-flex items-center gap-0.5 font-medium text-indigo-600 transition-colors group-hover:text-indigo-800">
            <span>View</span>
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        )}
      </div>
    </div>
  );
}
